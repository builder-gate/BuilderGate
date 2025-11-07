# Integración TAM y YDS: Cómo Funcionan Juntos

## Visión General

El sistema combina dos componentes principales:
- **YDS (Yield Donating Strategy)**: Vault que genera yield y dona solo el yield generado
- **TAM (Tokenized Allocation Mechanism)**: Distribuye el yield donado basado en reputación de builders

## Arquitectura del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GENERACIÓN DE YIELD                                          │
│    Uniswap v4 Pool → Swap → BuilderFeeHook → Fees               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CAPTURA DE FEES                                               │
│    BuilderFeeHook.afterSwap()                                    │
│    - Toma fee del swap (0.3-1%)                                 │
│    - Transfiere a BuilderFeeVault                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. YDS VAULT (Yield Donating Strategy)                          │
│    BuilderFeeVault (actualmente básico)                         │
│    → En futuro: ERC-4626 YDS completo                           │
│                                                                  │
│    Funcionamiento YDS:                                           │
│    - Usuarios depositan capital (principal)                     │
│    - Vault invierte en estrategias DeFi                          │
│    - Genera yield adicional                                      │
│    - PRESERVA el principal                                       │
│    - DONA solo el yield generado al TAM                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ (Yield donado)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. TAM (ReputationSplitter)                                     │
│    Recibe yield donado del YDS                                   │
│    - Acumula yield por época                                     │
│    - Builders presentan proofs de reputación                    │
│    - Calcula builderScore normalizado                           │
│    - Distribuye yield proporcionalmente                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. DISTRIBUCIÓN A BUILDERS                                      │
│    Builders con proofs válidos reclaman yield                   │
│    amount = (builderScore / totalScore) * availableYield        │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo Detallado Paso a Paso

### Fase 1: Generación y Captura de Yield

```solidity
// 1. Usuario ejecuta swap en Uniswap v4
swap(amountIn) → PoolManager

// 2. BuilderFeeHook intercepta el swap
afterSwap() {
    // Calcula fee (ej: 0.5% del output)
    feeAmount = (swapAmount * feeBps) / 10000;
    
    // Toma fee del pool
    poolManager.take(feeCurrency, address(this), feeAmount);
    
    // Transfiere al vault
    feeCurrency.transfer(vault, feeAmount);
    vault.onFeeReceived(feeCurrency, feeAmount);
}
```

### Fase 2: YDS Vault - Generación de Yield Adicional

**Estado Actual (BuilderFeeVault básico):**
- Solo almacena fees recibidos
- No genera yield adicional aún

**Estado Futuro (YDS completo ERC-4626):**

```solidity
// Usuarios depositan capital
deposit(amount) → Vault

// Vault invierte en estrategias DeFi
_deployFunds(amount) → Aave/Compound/Yearn

// Vault genera yield
_harvestAndReport() {
    totalAssets = deployedAssets + idleAssets;
    profit = totalAssets - previousTotalAssets;
    
    // Si hay profit, mintea shares solo para TAM
    if (profit > 0) {
        shares = convertToShares(profit);
        _mint(tamAddress, shares); // Solo yield, no principal
    }
}

// TAM puede redimir shares para obtener yield
redeem(shares) → TAM recibe yield
```

### Fase 3: TAM Recibe Yield Donado

```solidity
// YDS dona yield al TAM
// Opción A: Vault llama directamente
vault.redeem(shares, tamAddress) → TAM recibe tokens

// Opción B: TAM deposita yield manualmente (actual)
tam.depositYield(token, amount) {
    epochYield[currentEpoch][token] += amount;
}
```

### Fase 4: Builders Reclaman Yield

```solidity
// Builder presenta proofs
claimYield(
    githubScore, githubSignature,
    talentScore, talentSignature,
    selfVerified,
    token
) {
    // 1. Valida proofs
    validateProofs(...);
    
    // 2. Calcula builderScore
    score = (github * 40%) + (talent * 40%) + (self * 20%);
    
    // 3. Registra score en época
    epochBuilderScores[epoch][builder] = score;
    epochTotalScore[epoch] += score;
    
    // 4. Calcula porción proporcional
    claimAmount = (score / totalScore) * availableYield;
    
    // 5. Transfiere yield al builder
    transfer(builder, claimAmount);
}
```

## Separación de Responsabilidades

### YDS (Yield Donating Strategy)
**Responsabilidades:**
- ✅ Preservar el principal de los depositantes
- ✅ Generar yield adicional mediante estrategias DeFi
- ✅ Donar solo el yield generado (no el principal)
- ✅ Mantener contabilidad de shares (ERC-4626)

**Lo que NO hace:**
- ❌ No decide quién recibe el yield
- ❌ No valida reputación
- ❌ No distribuye a builders

### TAM (ReputationSplitter)
**Responsabilidades:**
- ✅ Validar proofs de reputación
- ✅ Calcular builderScores normalizados
- ✅ Distribuir yield proporcionalmente
- ✅ Gestionar épocas de distribución

**Lo que NO hace:**
- ❌ No genera yield
- ❌ No invierte en estrategias
- ❌ No preserva principal

## Ejemplo Numérico Completo

### Escenario:
- Vault tiene 1000 ETH de principal
- Vault genera 50 ETH de yield (5% APY)
- 3 builders reclaman con diferentes scores

### Paso 1: YDS Genera Yield
```
Principal: 1000 ETH (preservado)
Yield generado: 50 ETH
Yield donado al TAM: 50 ETH (solo yield, no principal)
```

### Paso 2: TAM Recibe Yield
```
TAM.depositYield(ETH, 50 ETH)
epochYield[1][ETH] = 50 ETH
```

### Paso 3: Builders Se Registran
```
Builder A: score = 80 (GitHub: 90, Talent: 85, Self: true)
Builder B: score = 60 (GitHub: 70, Talent: 50, Self: true)
Builder C: score = 40 (GitHub: 50, Talent: 30, Self: true)

Total Score = 80 + 60 + 40 = 180
```

### Paso 4: Distribución Proporcional
```
Builder A: (80 / 180) * 50 ETH = 22.22 ETH
Builder B: (60 / 180) * 50 ETH = 16.67 ETH
Builder C: (40 / 180) * 50 ETH = 11.11 ETH
Total: 50 ETH ✅
```

## Integración Actual vs Futura

### Estado Actual (MVP)
```
Hook → BuilderFeeVault (básico) → ReputationSplitter
       (solo almacena fees)        (distribuye fees directamente)
```

**Limitaciones:**
- Vault no genera yield adicional
- Fees van directamente al TAM
- No hay separación principal/yield

### Estado Futuro (YDS Completo)
```
Hook → YDS Vault (ERC-4626) → ReputationSplitter
       (genera yield)          (distribuye solo yield)
       (preserva principal)
```

**Ventajas:**
- Yield adicional generado
- Principal preservado
- Separación clara principal/yield
- Compatible con Octant v2

## Código de Integración

### Cómo el YDS dona yield al TAM

```solidity
// En el YDS Vault (futuro)
contract BuilderYieldVault is ERC4626 {
    address public immutable tamAddress;
    
    function _harvestAndReport() internal override returns (uint256) {
        uint256 totalAssets = _calculateTotalAssets();
        uint256 previousAssets = lastReportedAssets;
        
        if (totalAssets > previousAssets) {
            uint256 profit = totalAssets - previousAssets;
            
            // Mintea shares solo para TAM (solo yield)
            uint256 shares = convertToShares(profit);
            _mint(tamAddress, shares);
            
            // TAM puede redimir inmediatamente o acumular
        }
        
        return totalAssets;
    }
}

// En el TAM
contract ReputationSplitter {
    function receiveYieldFromVault(address vault, address token) external {
        // Redimir shares del vault
        uint256 shares = IERC4626(vault).balanceOf(address(this));
        uint256 assets = IERC4626(vault).redeem(shares, address(this), address(this));
        
        // Depositar en época actual
        epochYield[currentEpoch][token] += assets;
    }
}
```

## Ventajas de la Separación

1. **Modularidad**: Cada componente tiene una responsabilidad clara
2. **Upgradeabilidad**: Se puede mejorar YDS sin tocar TAM
3. **Flexibilidad**: TAM puede recibir yield de múltiples fuentes
4. **Seguridad**: Separación reduce superficie de ataque
5. **Escalabilidad**: Fácil agregar nuevas fuentes de yield o mecanismos de distribución

## Resumen

- **YDS**: Genera yield, preserva principal, dona solo yield
- **TAM**: Valida reputación, distribuye yield proporcionalmente
- **Flujo**: Hook → Vault (YDS) → TAM → Builders
- **Separación**: YDS no decide distribución, TAM no genera yield

