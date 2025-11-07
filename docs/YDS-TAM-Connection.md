# Conexión YDS → TAM: Cómo se Transfiere el Yield

## La Pregunta Clave

**¿Cómo el yield generado en el YDS llega al TAM para ser distribuido?**

Hay **dos formas** dependiendo de la implementación:

---

## Opción 1: Patrón YDS Completo (Automático)

En un YDS completo ERC-4626, el vault **mintea shares automáticamente** al TAM cuando hay yield.

### Cómo Funciona

```solidity
// En el YDS Vault
contract BuilderYieldVault is ERC4626 {
    address public immutable tamAddress; // Dirección del TAM
    
    function _harvestAndReport() internal override returns (uint256) {
        uint256 totalAssets = _calculateTotalAssets();
        uint256 previousAssets = lastReportedAssets;
        
        if (totalAssets > previousAssets) {
            uint256 profit = totalAssets - previousAssets; // Yield generado
            
            // Mintea shares SOLO para el TAM (solo el yield, no el principal)
            uint256 shares = convertToShares(profit);
            _mint(tamAddress, shares); // ✅ Automático
            
            // El TAM ahora tiene shares que representan el yield
        }
        
        return totalAssets;
    }
}
```

### Flujo Automático

```
1. Keeper llama report() en el vault
   ↓
2. Vault calcula yield generado
   ↓
3. Vault mintea shares automáticamente al TAM
   ↓
4. TAM tiene shares del vault
   ↓
5. TAM puede redimir shares cuando quiera distribuir
```

**Ventaja**: Automático, no requiere intervención manual.

---

## Opción 2: Patrón Manual (Actual MVP)

En el estado actual, el **owner o keeper** llama una función que transfiere yield del vault al TAM.

### Implementación Necesaria

Necesitamos agregar funciones en ambos contratos:

#### En BuilderFeeVault (YDS)

```solidity
contract BuilderFeeVault is IBuilderFeeVault {
    address public tamAddress; // Dirección del TAM
    
    // Solo owner puede setear el TAM
    function setTAMAddress(address _tam) external onlyOwner {
        tamAddress = _tam;
    }
    
    /**
     * @notice Donar yield al TAM (llamado por owner o keeper)
     * @param currency Currency a donar
     * @param amount Cantidad a donar (0 = todo el balance)
     */
    function donateYieldToTAM(Currency currency, uint256 amount) external {
        require(tamAddress != address(0), "TAM address not set");
        
        uint256 balance = balances[currency];
        uint256 donateAmount = amount == 0 ? balance : amount;
        require(donateAmount > 0, "No yield to donate");
        require(donateAmount <= balance, "Insufficient balance");
        
        // Actualizar balance
        balances[currency] -= donateAmount;
        
        // Transferir al TAM
        currency.transfer(tamAddress, donateAmount);
        
        // Notificar al TAM
        IReputationSplitter(tamAddress).onYieldReceived(currency, donateAmount);
        
        emit YieldDonated(currency, donateAmount);
    }
    
    event YieldDonated(Currency indexed currency, uint256 amount);
}
```

#### En ReputationSplitter (TAM)

```solidity
contract ReputationSplitter {
    /**
     * @notice Recibe yield del vault YDS
     * @param currency Currency recibida
     * @param amount Cantidad recibida
     */
    function onYieldReceived(Currency currency, uint256 amount) external {
        // Verificar que viene del vault (opcional pero recomendado)
        // require(msg.sender == vaultAddress, "Not authorized");
        
        address token = Currency.unwrap(currency) == address(0) 
            ? address(0) 
            : Currency.unwrap(currency);
        
        // Depositar en época actual
        epochYield[currentEpoch][token] += amount;
        
        emit YieldReceivedFromVault(currency, amount, currentEpoch);
    }
    
    event YieldReceivedFromVault(
        Currency indexed currency, 
        uint256 amount, 
        uint256 epoch
    );
}
```

### Flujo Manual

```
1. Owner/Keeper llama: vault.donateYieldToTAM(currency, amount)
   ↓
2. Vault transfiere tokens al TAM
   ↓
3. Vault llama: tam.onYieldReceived(currency, amount)
   ↓
4. TAM deposita yield en época actual
   ↓
5. Builders pueden reclamar
```

**Ventaja**: Control manual, puedes decidir cuándo y cuánto donar.

---

## Opción 3: TAM Redime Shares del Vault (Recomendado para YDS Completo)

Si el vault es ERC-4626 completo, el TAM puede **redimir shares** directamente.

### Implementación

```solidity
contract ReputationSplitter {
    address public immutable vaultAddress; // YDS Vault address
    
    /**
     * @notice Redimir shares del vault YDS para obtener yield
     * @param maxShares Máximo de shares a redimir (0 = todos)
     */
    function redeemYieldFromVault(uint256 maxShares) external {
        IERC4626 vault = IERC4626(vaultAddress);
        
        uint256 shares = maxShares == 0 
            ? vault.balanceOf(address(this))
            : maxShares;
        
        require(shares > 0, "No shares to redeem");
        
        // Redimir shares por assets (yield)
        uint256 assets = vault.redeem(
            shares,
            address(this), // Recibe assets
            address(this)  // Owner de las shares
        );
        
        // Determinar qué token es
        address asset = vault.asset();
        
        // Depositar en época actual
        epochYield[currentEpoch][asset] += assets;
        
        emit YieldRedeemedFromVault(shares, assets, currentEpoch);
    }
    
    event YieldRedeemedFromVault(
        uint256 shares, 
        uint256 assets, 
        uint256 epoch
    );
}
```

### Flujo con Redención

```
1. Vault genera yield → Mintea shares al TAM automáticamente
   ↓
2. TAM tiene shares del vault
   ↓
3. Owner/Keeper llama: tam.redeemYieldFromVault(0)
   ↓
4. TAM redime shares → Recibe assets (yield)
   ↓
5. TAM deposita en época actual
   ↓
6. Builders pueden reclamar
```

**Ventaja**: Más flexible, TAM controla cuándo redimir.

---

## Comparación de Opciones

| Opción | Automático | Control | Complejidad | Recomendado Para |
|--------|-----------|---------|-------------|------------------|
| **1. Mint Automático** | ✅ Sí | ❌ Bajo | Media | YDS completo |
| **2. Donación Manual** | ❌ No | ✅ Alto | Baja | MVP actual |
| **3. Redención por TAM** | ⚠️ Parcial | ✅ Alto | Media | YDS completo |

---

## Implementación Recomendada para tu Proyecto

### Fase 1: MVP (Actual)
Usar **Opción 2** (Donación Manual):

```solidity
// Owner llama periódicamente:
vault.donateYieldToTAM(currency, 0); // 0 = todo el balance
```

### Fase 2: YDS Completo
Usar **Opción 3** (Redención por TAM):

```solidity
// Vault mintea shares automáticamente
// TAM redime cuando quiere distribuir:
tam.redeemYieldFromVault(0); // 0 = todas las shares
```

---

## Ejemplo de Script para Owner/Keeper

```solidity
// Script para donar yield periódicamente
contract YieldDonationKeeper {
    BuilderFeeVault public vault;
    ReputationSplitter public tam;
    
    function donateAllYieldToTAM(Currency currency) external {
        uint256 balance = vault.getBalance(currency);
        if (balance > 0) {
            vault.donateYieldToTAM(currency, 0); // 0 = todo
        }
    }
    
    // Llamar periódicamente (ej: cada semana)
    function weeklyDonation() external {
        donateAllYieldToTAM(Currency.wrap(address(0))); // ETH
        // Agregar más currencies si es necesario
    }
}
```

---

## Resumen

**Respuesta corta**: 

- **MVP actual**: Owner llama `vault.donateYieldToTAM()` → Vault transfiere → TAM recibe
- **YDS completo**: Vault mintea shares automáticamente → TAM redime cuando quiere

**La clave**: El TAM **no llama** al YDS. Es al revés:
- YDS **dona** al TAM (automático o manual)
- TAM **recibe** y distribuye

