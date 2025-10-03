# BTC Trading Scenarios - Expert Visualizations

## 🎯 Scenario-Based Decision Trees

### Bull Market Scenario Analysis

```mermaid
graph TD
    A[Bull Market Detected] --> B{Volume Confirmation?}
    
    B --> |High Volume| C[Confirmed Bull Trend]
    B --> |Low Volume| D[Weak Bull Signal]
    
    C --> E[Position Size: 2% Risk]
    D --> F[Position Size: 1% Risk]
    
    E --> G{RSI Level?}
    F --> G
    
    G --> |< 70| H[Enter Long Position]
    G --> |70-80| I[Partial Position]
    G --> |> 80| J[Wait for Pullback]
    
    H --> K[Stop Loss: -2%]
    I --> L[Stop Loss: -1.5%]
    J --> M[Watch for Entry]
    
    K --> N[Take Profit: +4%]
    L --> O[Take Profit: +3%]
    M --> P[Entry on Dip]
    
    style A fill:#e8f5e8
    style C fill:#c8e6c9
    style H fill:#4caf50
    style N fill:#2e7d32
```

### Bear Market Scenario Analysis

```mermaid
graph TD
    A[Bear Market Detected] --> B{Volatility Level?}
    
    B --> |High Vol > 5%| C[Extreme Bear Conditions]
    B --> |Moderate Vol 2-5%| D[Standard Bear Market]
    B --> |Low Vol < 2%| E[Weak Bear Signal]
    
    C --> F[Capital Preservation Mode]
    D --> G[Conservative Short Strategy]
    E --> H[Neutral/Wait Strategy]
    
    F --> I[Position Size: 0.5% Risk]
    G --> J[Position Size: 1% Risk]
    H --> K[No New Positions]
    
    I --> L[Short with Tight Stops]
    J --> M[Moderate Short Position]
    K --> N[Cash Position]
    
    L --> O[Quick Profit Taking]
    M --> P[Swing Short Strategy]
    N --> Q[Wait for Reversal]
    
    style A fill:#ffebee
    style C fill:#ffcdd2
    style F fill:#f44336
    style I fill:#d32f2f
```

### Range-Bound Market Scenario

```mermaid
graph TD
    A[Range-Bound Market] --> B{Range Width?}
    
    B --> |Wide Range > 5%| C[Strong Range Trading]
    B --> |Narrow Range 2-5%| D[Moderate Range Trading]
    B --> |Tight Range < 2%| E[Low Probability Setup]
    
    C --> F[Buy at Support]
    C --> G[Sell at Resistance]
    D --> H[Smaller Positions]
    E --> I[Avoid Trading]
    
    F --> J[Stop: Below Support]
    G --> K[Stop: Above Resistance]
    H --> L[Tight Risk Management]
    I --> M[Wait for Breakout]
    
    J --> N[Target: Mid-Range]
    K --> O[Target: Mid-Range]
    L --> P[Quick Scalping]
    M --> Q[Breakout Strategy]
    
    style A fill:#fff3e0
    style C fill:#ffcc02
    style F fill:#ff9800
    style N fill:#f57c00
```

## 📈 Risk Management Decision Matrix

```mermaid
graph LR
    A[Current Drawdown] --> B{< 5%}
    A --> C{5-10%}
    A --> D{> 10%}
    
    B --> E[Normal Operations]
    C --> F[Reduce Risk 50%]
    D --> G[Emergency Stop]
    
    E --> H[Full Position Sizing]
    F --> I[Half Position Sizing]
    G --> J[No New Positions]
    
    H --> K{Sharpe Ratio}
    I --> K
    J --> L[Review Strategy]
    
    K --> |> 2.0| M[Increase Allocation]
    K --> |1.0-2.0| N[Maintain Current]
    K --> |< 1.0| O[Reduce Allocation]
    
    style B fill:#c8e6c9
    style C fill:#fff3e0
    style D fill:#ffcdd2
    style G fill:#f44336
```

## 🎛️ Position Sizing Calculator Flow

```mermaid
graph TD
    A[Account Balance: $100,000] --> B[Risk Per Trade: 2%]
    B --> C[Risk Amount: $2,000]
    
    C --> D{Entry Price vs Stop Loss}
    
    D --> E[BTC @ $60,000]
    D --> F[Stop Loss @ $58,800]
    
    E --> G[Price Risk: $1,200]
    F --> G
    
    G --> H[Position Size Calculation]
    H --> I[Risk Amount ÷ Price Risk]
    I --> J[$2,000 ÷ $1,200 = 1.67 BTC]
    
    J --> K{Leverage Decision}
    
    K --> L[No Leverage: $100,000 required]
    K --> M[2x Leverage: $50,000 required]
    K --> N[3x Leverage: $33,333 required]
    
    L --> O{Affordable?}
    M --> O
    N --> O
    
    O --> |Yes| P[Execute Trade]
    O --> |No| Q[Reduce Position Size]
    
    Q --> R[Max Affordable Position]
    R --> S[Adjust Risk Accordingly]
    
    style A fill:#e3f2fd
    style C fill:#bbdefb
    style J fill:#2196f3
    style P fill:#1976d2
```

## 📊 Performance Analysis Hierarchy

```mermaid
graph TD
    A[Performance Metrics] --> B[Risk-Adjusted Returns]
    A --> C[Raw Performance]
    A --> D[Consistency Metrics]
    
    B --> E[Sharpe Ratio]
    B --> F[Sortino Ratio]
    B --> G[Calmar Ratio]
    
    C --> H[Total Return %]
    C --> I[Monthly Returns]
    C --> J[Peak Performance]
    
    D --> K[Win Rate %]
    D --> L[Profit Factor]
    D --> M[Max Drawdown]
    
    E --> N{> 2.0}
    F --> O{> 1.5}
    G --> P{> 1.0}
    
    N --> |Yes| Q[Excellent]
    N --> |No| R[Review Strategy]
    
    style A fill:#f3e5f5
    style B fill:#e1bee7
    style Q fill:#9c27b0
    style R fill:#ff5722
```

## 🌊 Market Regime Classification

```mermaid
pie title Market Regime Distribution (Historical)
    "Bull Trends" : 35
    "Bear Trends" : 25
    "Range-Bound" : 30
    "High Volatility" : 10
```

```mermaid
graph LR
    A[Market Regime Detection] --> B[Technical Indicators]
    A --> C[Volatility Measures]
    A --> D[Volume Analysis]
    
    B --> E[Moving Averages]
    B --> F[Momentum Oscillators]
    B --> G[Trend Strength]
    
    C --> H[ATR Percentile]
    C --> I[VIX Analog]
    C --> J[Price Volatility]
    
    D --> K[Volume Spike]
    D --> L[Volume Trend]
    D --> M[Institutional Flow]
    
    E --> N{Regime Classification}
    F --> N
    G --> N
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Bull Trend]
    N --> P[Bear Trend]
    N --> Q[Range Bound]
    N --> R[High Volatility]
    
    style A fill:#e8eaf6
    style N fill:#3f51b5
    style O fill:#4caf50
    style P fill:#f44336
    style Q fill:#ff9800
    style R fill:#9c27b0
```

## 🎯 Expert Trading Rules Flowchart

```mermaid
graph TD
    A[New Market Signal] --> B{Risk Assessment}
    
    B --> C{Portfolio Exposure < 20%?}
    
    C --> |Yes| D{Drawdown < 10%?}
    C --> |No| E[No New Positions]
    
    D --> |Yes| F{Sharpe Ratio > 1.5?}
    D --> |No| G[Reduce Existing Positions]
    
    F --> |Yes| H[Normal Position Size]
    F --> |No| I[Reduced Position Size]
    
    H --> J[2% Risk Per Trade]
    I --> K[1% Risk Per Trade]
    
    J --> L{Market Regime}
    K --> L
    
    L --> |Bull Trend| M[Trend Following]
    L --> |Bear Trend| N[Short Strategy]
    L --> |Range Bound| O[Mean Reversion]
    L --> |High Volatility| P[Capital Preservation]
    
    M --> Q[Entry Execution]
    N --> Q
    O --> Q
    P --> R[Wait for Stability]
    
    style A fill:#f3e5f5
    style B fill:#e1bee7
    style J fill:#4caf50
    style K fill:#ff9800
    style P fill:#f44336
```

## 🏆 Expert Performance Benchmarks

| Metric | Beginner | Intermediate | Expert | Elite |
|--------|----------|--------------|--------|-------|
| Sharpe Ratio | < 0.5 | 0.5 - 1.0 | 1.0 - 2.0 | > 2.0 |
| Max Drawdown | > 25% | 15-25% | 5-15% | < 5% |
| Win Rate | < 40% | 40-50% | 50-60% | > 60% |
| Profit Factor | < 1.2 | 1.2-1.5 | 1.5-2.0 | > 2.0 |
| Consistency | Low | Medium | High | Very High |

## 🔄 Adaptive Strategy Selection

```mermaid
graph LR
    A[Real-time Market Data] --> B[Regime Detection]
    B --> C{Current Regime}
    
    C --> |Bull| D[Trend Following Active]
    C --> |Bear| E[Short Strategy Active]
    C --> |Range| F[Mean Reversion Active]
    C --> |Volatile| G[Preservation Active]
    
    D --> H[Position Size: 2%]
    E --> I[Position Size: 1.5%]
    F --> J[Position Size: 1%]
    G --> K[Position Size: 0.5%]
    
    H --> L[Leverage: Up to 3x]
    I --> M[Leverage: Up to 2x]
    J --> N[Leverage: Up to 2x]
    K --> O[Leverage: 1x Only]
    
    style A fill:#e3f2fd
    style B fill:#bbdefb
    style D fill:#4caf50
    style E fill:#f44336
    style F fill:#ff9800
    style G fill:#9c27b0
```

This comprehensive visualization framework provides expert-level decision trees for every major trading scenario, ensuring the autonomous agents have clear guidance for professional-level trading decisions.