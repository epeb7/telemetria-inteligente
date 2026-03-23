# Telemetria Inteligente de Veículos

Um sistema minimalista e interativo de monitoramento de frotas de veículos em tempo real, construído com React, TypeScript e Google Maps.

## 🎯 Características

- **Mapa Interativo**: Visualização em tempo real de todos os veículos em um mapa Google Maps
- **Painel de Controle**: Layout assimétrico com 70% mapa e 30% painel de controle
- **Monitoramento em Tempo Real**: Simulação de telemetria com atualização a cada 3 segundos
- **Alertas Inteligentes**: Sistema de alertas por severidade (baixa, média, alta)
- **Gráficos de Telemetria**: Visualização de histórico de velocidade, combustível e temperatura
- **Design Minimalista**: Interface limpa e eficiente, focada em dados
- **Responsivo**: Adaptável para diferentes tamanhos de tela

## 📊 Métricas Monitoradas

- **Velocidade**: Monitoramento de velocidade do veículo (0-120 km/h)
- **Combustível**: Nível de combustível em percentual (0-100%)
- **Temperatura**: Temperatura do motor (80-120°C)
- **Localização**: Latitude e longitude em tempo real
- **Status**: Ativo, Aviso, Erro ou Offline

## 🏗️ Arquitetura

### Estrutura de Pastas

```
client/
  src/
    components/
      VehicleMap.tsx          # Mapa interativo com Google Maps
      VehicleList.tsx         # Lista de veículos com status
      TelemetryChart.tsx      # Gráficos de telemetria
    hooks/
      useTelemetry.ts         # Hook para simular telemetria
    pages/
      Home.tsx                # Página principal
    index.css                 # Estilos globais e tema
    App.tsx                   # Roteamento principal
shared/
  types.ts                    # Tipos TypeScript compartilhados
  mockData.ts                 # Dados de exemplo
```

### Tipos Principais

**Vehicle**: Representa um veículo com todas suas métricas
```typescript
interface Vehicle {
  id: string;
  name: string;
  plate: string;
  status: 'active' | 'warning' | 'error' | 'offline';
  latitude: number;
  longitude: number;
  speed: number;
  fuel: number;
  temperature: number;
  lastUpdate: Date;
  driver: string;
  route?: string;
}
```

**Alert**: Representa um alerta do sistema
```typescript
interface Alert {
  id: string;
  vehicleId: string;
  type: 'speed' | 'temperature' | 'fuel' | 'maintenance' | 'location';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  resolved: boolean;
}
```

**TelemetryPoint**: Ponto de dados de telemetria
```typescript
interface TelemetryPoint {
  vehicleId: string;
  timestamp: Date;
  speed: number;
  latitude: number;
  longitude: number;
  fuel: number;
  temperature: number;
}
```

## 🎨 Design e Estilo

### Filosofia de Design

A interface segue o **Minimalismo Escandinavo** com foco em clareza radical e hierarquia visual através de espaçamento e peso tipográfico.

### Paleta de Cores

- **Fundo**: Branco quente (oklch(0.98 0.001 60))
- **Primária**: Azul moderno (oklch(0.55 0.2 200))
- **Status Ativo**: Verde (oklch(0.65 0.2 120))
- **Status Aviso**: Laranja (oklch(0.7 0.25 40))
- **Status Erro**: Vermelho (oklch(0.6 0.25 20))

### Tipografia

- **Títulos**: Geist (600 weight)
- **Corpo**: Inter (400 weight)
- **Hierarquia**: 5 níveis (display, h1, h2, body, small)

### Animações

- Entrada suave (fade-in 300ms)
- Pulsação para alertas (2s loop)
- Transição de cores (150ms)
- Movimento de mapa suave

## 🚀 Desenvolvimento

### Instalação

```bash
pnpm install
```

### Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

### Build para Produção

```bash
pnpm build
```

### Verificação de Tipos

```bash
pnpm check
```

## 📱 Componentes Principais

### VehicleMap
Componente que renderiza o mapa interativo com marcadores de veículos.

**Props:**
- `vehicles`: Array de veículos a exibir
- `selectedVehicle`: Veículo selecionado (opcional)
- `onVehicleSelect`: Callback ao selecionar um veículo

### VehicleList
Lista interativa de veículos com status e métricas resumidas.

**Props:**
- `vehicles`: Array de veículos
- `selectedVehicleId`: ID do veículo selecionado
- `onSelectVehicle`: Callback ao selecionar um veículo

### TelemetryChart
Gráfico de linha para visualizar histórico de telemetria.

**Props:**
- `data`: Array de pontos de telemetria
- `metric`: Tipo de métrica ('speed', 'fuel', 'temperature')
- `title`: Título do gráfico

## 🔧 Hooks Customizados

### useTelemetry
Hook que simula telemetria em tempo real para um veículo.

```typescript
const telemetryData = useTelemetry(vehicleId, maxDataPoints);
```

**Parâmetros:**
- `vehicleId`: ID do veículo
- `maxDataPoints`: Número máximo de pontos a manter (padrão: 20)

**Retorno:**
- Array de `TelemetryPoint` atualizado a cada 3 segundos

## 🗺️ Google Maps Integration

O componente `VehicleMap` utiliza a integração automática com Google Maps através do proxy Manus. Todos os marcadores são customizados com cores baseadas no status do veículo.

**Cores de Status:**
- Verde: Veículo ativo
- Laranja: Aviso
- Vermelho: Erro
- Cinza: Offline

## 📈 Simulação de Dados

O sistema simula dados de telemetria em tempo real:

- **Velocidade**: Varia entre 0-120 km/h com mudanças aleatórias
- **Combustível**: Decresce gradualmente (consumo simulado)
- **Temperatura**: Varia entre 80-120°C
- **Localização**: Pequenos deslocamentos aleatórios

Os dados são atualizados a cada 3 segundos.

## 🎯 Casos de Uso

### Para Desenvolvedores Web Juniores

Este projeto é ideal para aprender:

1. **React Hooks**: useState, useEffect, custom hooks
2. **TypeScript**: Tipagem de componentes e dados
3. **Integração com APIs**: Google Maps
4. **Gerenciamento de Estado**: Simulação de dados em tempo real
5. **Componentes Reutilizáveis**: Padrão de composição
6. **Tailwind CSS**: Estilização moderna
7. **shadcn/ui**: Componentes de UI prontos

### Para Produção

Para usar em produção:

1. Conectar a uma API real de telemetria
2. Implementar autenticação
3. Adicionar persistência de dados
4. Implementar WebSockets para atualizações em tempo real
5. Adicionar mais tipos de alertas
6. Implementar histórico de eventos

## 🔄 Fluxo de Dados

1. **Inicialização**: Dados de exemplo são carregados
2. **Simulação**: Hook `useTelemetry` gera dados aleatórios
3. **Atualização**: Estado é atualizado a cada 3 segundos
4. **Renderização**: Componentes reagem às mudanças
5. **Visualização**: Mapa e gráficos são atualizados

## 🛠️ Extensibilidade

### Adicionar Novo Tipo de Alerta

1. Adicionar tipo em `shared/types.ts`
2. Criar lógica de detecção em `Home.tsx`
3. Adicionar UI em componente apropriado

### Conectar API Real

1. Substituir `mockData.ts` por chamadas HTTP
2. Usar `useEffect` para buscar dados
3. Implementar WebSocket para atualizações em tempo real

### Adicionar Novas Métricas

1. Estender interface `Vehicle` em `shared/types.ts`
2. Atualizar `useTelemetry` para simular nova métrica
3. Criar novo `TelemetryChart` ou atualizar existente

## 📝 Notas de Desenvolvimento

- O projeto usa **web-static** scaffold (frontend apenas)
- Google Maps é integrado automaticamente via proxy Manus
- Dados são simulados em cliente (sem backend)
- Ideal para prototipagem rápida e aprendizado

## 🚀 Próximos Passos

1. Conectar a uma API de telemetria real
2. Implementar persistência de dados
3. Adicionar mais tipos de veículos
4. Implementar filtros avançados
5. Adicionar exportação de relatórios
6. Implementar modo dark
7. Adicionar notificações push

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido com

- React 19
- TypeScript 5.6
- Tailwind CSS 4
- shadcn/ui
- Recharts
- Lucide React
- Google Maps API
- Wouter (roteamento)
