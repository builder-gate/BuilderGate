# Integración con Safe Multisig: Depósitos Directos al Vault

## Resumen

**No necesitas cambiar la arquitectura**. Solo agregamos una **puerta directa** al vault que permite que multisigs (Safe) depositen directamente, además del hook de Uniswap.

## Arquitectura Actualizada

```
┌─────────────────────────────────────────────────────────────┐
│ FUENTES DE YIELD                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Uniswap v4 Hook                                         │
│     → Captura fees de swaps                                 │
│     → BuilderFeeHook.onFeeReceived()                        │
│                                                              │
│  2. Depósitos Directos (NUEVO)                              │
│     → Safe multisigs                                        │
│     → DAO treasuries                                        │
│     → Ethereum Foundation                                   │
│     → Cualquier wallet                                      │
│     → vault.deposit()                                       │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BUILDER FEE VAULT                                           │
│ - Acumula yield de todas las fuentes                        │
│ - Tracking separado: fees vs direct deposits                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ TAM (ReputationSplitter)                                    │
│ - Recibe yield donado del vault                             │
│ - Distribuye a builders según reputación                    │
└─────────────────────────────────────────────────────────────┘
```

## Cambios Implementados

### 1. Función `deposit()` en BuilderFeeVault

```solidity
// Cualquier wallet puede depositar directamente
vault.deposit(currency, amount);
```

**Características:**
- ✅ Soporta ETH y ERC20
- ✅ Tracking por depositor
- ✅ Eventos para auditoría
- ✅ Separación de fuentes (fees vs direct deposits)

### 2. SafeModule para Multisigs

```solidity
// Módulo que facilita depósitos desde Safe
SafeModule.depositToVault(currency, amount);
```

**Ventajas:**
- ✅ Integración fácil con Safe UI
- ✅ Batch deposits (múltiples tokens en una tx)
- ✅ Seguridad de multisig

## Casos de Uso

### Caso 1: Ethereum Foundation Treasury

```solidity
// Safe de Ethereum Foundation quiere donar 1000 ETH
// 1. Habilitar módulo en Safe (una vez)
safe.enableModule(safeModuleAddress);

// 2. Crear transacción en Safe UI
// To: safeModuleAddress
// Function: depositToVault
// Params: currency (ETH), amount (1000 ETH)
// Value: 1000 ETH

// 3. Firmar con quorum de Safe
// 4. Ejecutar transacción
```

### Caso 2: DAO con Recompensas de Nodos

```solidity
// DAO recibe recompensas de staking en su Safe
// Quiere donar periódicamente

// Batch deposit: múltiples tokens en una tx
safeModule.batchDepositToVault(
    [ETH, USDC, DAI],  // currencies
    [10 ETH, 50000 USDC, 30000 DAI]  // amounts
);
```

### Caso 3: Rondas de Financiación Temporales

```solidity
// DAO quiere correr una "ronda" de 1 mes
// Deposita al inicio de la ronda
vault.deposit(Currency.wrap(USDC), 100000 * 1e6);

// Al final del mes, owner dona al TAM
vault.donateYieldToTAM(Currency.wrap(USDC), 0);
```

## Cómo Usar el SafeModule

### Paso 1: Desplegar el Módulo

```solidity
// Deploy
SafeModule module = new SafeModule(vaultAddress);
```

### Paso 2: Habilitar en Safe

**Opción A: Via Safe UI**
1. Ir a Safe → Settings → Modules
2. Agregar módulo: `moduleAddress`
3. Confirmar con quorum

**Opción B: Via Script**
```solidity
// Desde Safe
safe.enableModule(moduleAddress);
```

### Paso 3: Depositar desde Safe

**Via Safe UI:**
1. New Transaction
2. To: `moduleAddress`
3. Function: `depositToVault`
4. Params:
   - `currency`: `0x0000000000000000000000000000000000000000` (ETH)
   - `amount`: `1000000000000000000` (1 ETH en wei)
5. Value: 1 ETH (si es ETH)
6. Firmar y ejecutar

**Via Script:**
```solidity
// Desde Safe
bytes memory data = abi.encodeWithSignature(
    "depositToVault(address,uint256)",
    Currency.wrap(address(0)), // ETH
    1 ether
);
safe.execTransaction(
    moduleAddress,
    1 ether, // value
    data,
    0, // operation
    0, // safeTxGas
    0, // baseGas
    0, // gasPrice
    address(0), // gasToken
    address(0), // refundReceiver
    signatures
);
```

## Tracking y Transparencia

### Consultar Depósitos

```solidity
// Total de direct deposits
uint256 total = vault.getTotalDirectDeposits(currency);

// Depósitos de un wallet específico
uint256 userDeposits = vault.getDepositorBalance(depositor, currency);

// Total de fees del hook
uint256 fees = vault.getTotalFeesReceived(currency);

// Balance total (fees + direct deposits)
uint256 totalBalance = vault.getBalance(currency);
```

### Eventos

```solidity
// Cuando Safe deposita
event SafeDeposit(
    address indexed safe,
    Currency indexed currency,
    uint256 amount,
    address vault
);

// Cuando cualquier wallet deposita
event DirectDeposit(
    address indexed depositor,
    Currency indexed currency,
    uint256 amount,
    uint256 newBalance
);
```

## Flujo Completo: Ronda de Financiación

### Escenario: DAO quiere financiar builders por 3 meses

```
Mes 1:
├─ DAO deposita 1000 ETH en Safe
├─ Safe ejecuta: module.depositToVault(ETH, 1000 ETH)
├─ Vault acumula: balances[ETH] += 1000 ETH
└─ Owner dona al TAM: vault.donateYieldToTAM(ETH, 0)

Mes 2:
├─ Builders reclaman yield del Mes 1
├─ DAO deposita otros 1000 ETH
└─ Owner dona al TAM

Mes 3:
├─ Builders reclaman yield del Mes 2
├─ DAO deposita otros 1000 ETH
└─ Owner dona al TAM
```

## Ventajas de esta Arquitectura

### ✅ Sin Cambios en Arquitectura Core

- El vault ya recibía de múltiples fuentes (hook)
- Solo agregamos otra fuente (direct deposits)
- El TAM no cambia, sigue distribuyendo igual

### ✅ Flexibilidad

- Multisigs pueden depositar cuando quieran
- No dependen del volumen de swaps
- Pueden correr "rondas" temporales

### ✅ Transparencia

- Tracking separado de fuentes
- Eventos para auditoría
- Consultas públicas de balances

### ✅ Seguridad

- Safe multisig mantiene control
- Módulo no puede retirar, solo depositar
- Owner del vault controla donaciones al TAM

## Comparación: Hook vs Direct Deposits

| Aspecto | Uniswap Hook | Direct Deposits |
|---------|-------------|-----------------|
| **Fuente** | Fees de swaps | Multisigs/DAOs |
| **Volumen** | Depende de trading | Controlado por depositor |
| **Frecuencia** | Continuo | On-demand |
| **Velocidad** | Lento (acumula) | Rápido (grandes sumas) |
| **Uso** | Generación pasiva | Rondas activas |

## Ejemplo de Integración Completa

```typescript
// Frontend para Safe
import { SafeTransaction } from '@safe-global/safe-core-sdk';

async function depositFromSafe(
    safe: Safe,
    currency: string,
    amount: string
) {
    const module = new ethers.Contract(
        SAFE_MODULE_ADDRESS,
        SAFE_MODULE_ABI
    );

    // Crear transacción
    const tx = await safe.createTransaction({
        to: SAFE_MODULE_ADDRESS,
        value: currency === 'ETH' ? amount : '0',
        data: module.interface.encodeFunctionData('depositToVault', [
            currency === 'ETH' 
                ? '0x0000000000000000000000000000000000000000'
                : currency,
            amount
        ]),
    });

    // Firmar
    const signedTx = await safe.signTransaction(tx);
    
    // Ejecutar (requiere quorum)
    await safe.executeTransaction(signedTx);
}
```

## Resumen

**No necesitas cambiar la arquitectura**. Solo agregamos:

1. ✅ Función `deposit()` pública en vault
2. ✅ SafeModule para facilitar depósitos
3. ✅ Tracking separado de fuentes

**El flujo sigue igual:**
- Vault recibe (de hook O direct deposits)
- Owner dona al TAM
- TAM distribuye a builders

**Ventaja:** Ahora tienes **múltiples fuentes de yield** sin cambiar el core del sistema.

