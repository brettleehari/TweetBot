// Expert BTC Trading Methodology Integration
// Implements professional trading principles into autonomous agents

class BTCExpertMethodology {
    constructor() {
        this.riskFreeRate = 2.0; // Treasury rate baseline
        this.maxSinglePositionRisk = 0.02; // 2% max risk per trade
        this.maxDrawdownLimit = 0.10; // 10% max drawdown
        this.targetSharpeRatio = 2.0; // Minimum acceptable Sharpe
        this.maxLeverage = 3.0; // 3x max leverage (experts prefer 1-3x)
        this.regimeThresholds = {
            volatilityHigh: 0.05, // 5% daily volatility
            momentumStrong: 0.02, // 2% momentum threshold
            volumeSpike: 2.0 // 2x average volume
        };
    }

    // Detect current market regime (critical for strategy selection)
    async detectMarketRegime(marketData) {
        const { price_usd, volume, volatility } = marketData;
        
        // Calculate momentum indicators
        const momentum = await this.calculateMomentum(price_usd);
        const volumeRatio = volume / (await this.getAverageVolume());
        
        // Expert regime classification
        if (volatility > this.regimeThresholds.volatilityHigh) {
            return {
                regime: 'HIGH_VOLATILITY_SPIKE',
                strategy: 'CAPITAL_PRESERVATION',
                riskMultiplier: 0.3, // Reduce risk by 70%
                leverageMax: 1.0, // No leverage during chaos
                description: 'Black swan / macro event - preserve capital'
            };
        }
        
        if (Math.abs(momentum) > this.regimeThresholds.momentumStrong && 
            volumeRatio > this.regimeThresholds.volumeSpike) {
            return {
                regime: 'TRENDING_MARKET',
                strategy: 'TREND_FOLLOWING',
                riskMultiplier: 1.0, // Normal risk
                leverageMax: 3.0, // Full leverage allowed
                direction: momentum > 0 ? 'BULLISH' : 'BEARISH',
                description: 'Strong momentum with volume confirmation'
            };
        }
        
        return {
            regime: 'CHOPPY_RANGE_BOUND',
            strategy: 'MEAN_REVERSION',
            riskMultiplier: 0.7, // Slightly reduced risk
            leverageMax: 2.0, // Moderate leverage
            description: 'Sideways market - market making opportunities'
        };
    }

    // Expert position sizing (never risk more than 2% of capital)
    calculateExpertPositionSize(portfolioValue, entryPrice, stopLoss, regime) {
        const riskAmount = portfolioValue * this.maxSinglePositionRisk * regime.riskMultiplier;
        const priceRisk = Math.abs(entryPrice - stopLoss);
        
        // Position size = Risk Amount / Price Risk
        const basePositionSize = riskAmount / priceRisk;
        
        // Apply regime-specific adjustments
        const adjustedSize = this.applyRegimeAdjustments(basePositionSize, regime);
        
        return {
            positionSizeUSD: adjustedSize,
            riskAmount: riskAmount,
            riskPercentage: (riskAmount / portfolioValue) * 100,
            leverage: Math.min(regime.leverageMax, this.maxLeverage),
            stopLoss: stopLoss,
            reasoning: `Regime: ${regime.regime}, Risk: ${(riskAmount/portfolioValue*100).toFixed(2)}%`
        };
    }

    // Performance validation using expert metrics
    async validatePerformanceExpert(performanceMetrics) {
        const { sharpeRatio, maxDrawdown, winRate, totalReturn } = performanceMetrics;
        
        const expertScore = {
            sharpeRatio: this.scoreMetric(sharpeRatio, this.targetSharpeRatio, 'higher_better'),
            drawdownControl: this.scoreMetric(maxDrawdown, this.maxDrawdownLimit, 'lower_better'),
            consistency: this.scoreConsistency(winRate),
            riskAdjustedReturn: this.calculateRiskAdjustedScore(totalReturn, maxDrawdown),
            overall: 0
        };
        
        // Expert weighting: Risk control > Returns
        expertScore.overall = (
            expertScore.sharpeRatio * 0.30 +
            expertScore.drawdownControl * 0.35 + // Highest weight on risk control
            expertScore.consistency * 0.20 +
            expertScore.riskAdjustedReturn * 0.15
        );
        
        return {
            expertScore: expertScore.overall,
            recommendation: this.getExpertRecommendation(expertScore),
            criticalIssues: this.identifyCriticalIssues(expertScore),
            expertAnalysis: {
                verdict: expertScore.overall > 0.7 ? 'EXPERT_APPROVED' : 
                        expertScore.overall > 0.5 ? 'NEEDS_IMPROVEMENT' : 'HIGH_RISK',
                focus: expertScore.drawdownControl < 0.5 ? 'RISK_CONTROL' : 
                      expertScore.sharpeRatio < 0.5 ? 'EFFICIENCY' : 'OPTIMIZATION'
            }
        };
    }

    // Expert trading rules for autonomous agents
    getExpertTradingRules() {
        return {
            positionManagement: {
                maxSingleRisk: this.maxSinglePositionRisk,
                maxTotalExposure: 0.20, // 20% max total BTC exposure
                stopLossRequired: true,
                takeProfitRatio: 2.0, // 2:1 reward:risk minimum
                rebalancingFrequency: 'daily'
            },
            
            riskControl: {
                maxDrawdown: this.maxDrawdownLimit,
                maxConsecutiveLosses: 3,
                maxDailyLoss: 0.05, // 5% daily loss limit
                emergencyStop: 0.15, // 15% portfolio loss emergency stop
                volatilityAdjustment: true
            },
            
            regimeAdaptation: {
                regimeDetection: 'realtime',
                strategySwitch: 'automatic',
                leverageAdjustment: 'dynamic',
                capitalPreservationMode: 'volatility_triggered'
            },
            
            performanceStandards: {
                minimumSharpe: this.targetSharpeRatio,
                maximumDrawdown: this.maxDrawdownLimit,
                minimumWinRate: 0.45, // 45% win rate acceptable with proper R:R
                reviewFrequency: 'weekly'
            }
        };
    }

    // Expert decision framework for agents
    async makeExpertDecision(marketData, portfolioState, agentContext) {
        // 1. Detect market regime
        const regime = await this.detectMarketRegime(marketData);
        
        // 2. Assess current risk exposure
        const riskAssessment = await this.assessCurrentRisk(portfolioState);
        
        // 3. Calculate expert position size
        const positionGuidance = this.calculateExpertPositionSize(
            portfolioState.totalValue,
            marketData.price_usd,
            this.calculateStopLoss(marketData, regime),
            regime
        );
        
        // 4. Generate expert decision
        const decision = {
            regime: regime,
            action: this.determineExpertAction(regime, riskAssessment, positionGuidance),
            positionGuidance: positionGuidance,
            riskAssessment: riskAssessment,
            reasoning: this.generateExpertReasoning(regime, riskAssessment, positionGuidance),
            confidence: this.calculateConfidence(regime, riskAssessment),
            expertPrinciples: [
                'Capital preservation first',
                'Risk-adjusted returns over absolute returns',
                'Regime-appropriate strategy selection',
                'Systematic risk management'
            ]
        };
        
        return decision;
    }

    // Helper methods for expert calculations
    async calculateMomentum(currentPrice) {
        // Implementation for momentum calculation
        return 0.015; // Placeholder
    }
    
    async getAverageVolume() {
        // Implementation for average volume
        return 1000000; // Placeholder
    }
    
    applyRegimeAdjustments(baseSize, regime) {
        return baseSize * regime.riskMultiplier;
    }
    
    scoreMetric(value, target, direction) {
        if (direction === 'higher_better') {
            return Math.min(value / target, 1.0);
        } else {
            return Math.max(1.0 - (value / target), 0);
        }
    }
    
    scoreConsistency(winRate) {
        // Prefer 45-55% win rate with good R:R over very high win rates
        const optimal = 0.5;
        return 1.0 - Math.abs(winRate - optimal) * 2;
    }
    
    calculateRiskAdjustedScore(returns, drawdown) {
        return drawdown > 0 ? returns / drawdown : 0;
    }
    
    getExpertRecommendation(expertScore) {
        if (expertScore.overall > 0.8) return 'CONTINUE_CURRENT_STRATEGY';
        if (expertScore.drawdownControl < 0.3) return 'REDUCE_RISK_IMMEDIATELY';
        if (expertScore.sharpeRatio < 0.3) return 'IMPROVE_EFFICIENCY';
        return 'OPTIMIZE_PERFORMANCE';
    }
    
    identifyCriticalIssues(expertScore) {
        const issues = [];
        if (expertScore.drawdownControl < 0.3) issues.push('EXCESSIVE_DRAWDOWN');
        if (expertScore.sharpeRatio < 0.2) issues.push('POOR_RISK_ADJUSTED_RETURNS');
        if (expertScore.consistency < 0.3) issues.push('INCONSISTENT_PERFORMANCE');
        return issues;
    }
    
    async assessCurrentRisk(portfolioState) {
        return {
            currentExposure: 0.15, // 15% BTC exposure
            riskLevel: 'moderate',
            drawdownFromPeak: 0.05
        };
    }
    
    calculateStopLoss(marketData, regime) {
        const volatilityMultiplier = regime.regime === 'HIGH_VOLATILITY_SPIKE' ? 0.5 : 1.0;
        return marketData.price_usd * (1 - 0.02 * volatilityMultiplier); // 2% stop loss
    }
    
    determineExpertAction(regime, risk, position) {
        if (regime.regime === 'HIGH_VOLATILITY_SPIKE') return 'PRESERVE_CAPITAL';
        if (risk.currentExposure > 0.20) return 'REDUCE_POSITION';
        if (regime.strategy === 'TREND_FOLLOWING') return 'FOLLOW_TREND';
        return 'WAIT_FOR_SETUP';
    }
    
    generateExpertReasoning(regime, risk, position) {
        return `Expert Analysis: ${regime.description}. Current risk: ${risk.riskLevel}. Position guidance: ${position.reasoning}`;
    }
    
    calculateConfidence(regime, risk) {
        let confidence = 0.7; // Base confidence
        if (regime.regime === 'HIGH_VOLATILITY_SPIKE') confidence *= 0.6;
        if (risk.drawdownFromPeak > 0.08) confidence *= 0.7;
        return confidence;
    }
}

export default BTCExpertMethodology;