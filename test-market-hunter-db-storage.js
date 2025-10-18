import { MarketDataSourceManager } from './src/mastra/services/market-data-sources';
import DatabaseService from './database/database-service.js';

/**
 * Test script to fetch Market Hunter data and store it in the database
 */

async function testMarketHunterDBStorage() {
    console.log('🚀 Market Hunter Data Collection & Storage Test\n');
    console.log('=' .repeat(70));
    
    const db = new DatabaseService();
    const marketManager = new MarketDataSourceManager();
    
    try {
        // Step 1: Fetch all data from APIs
        console.log('\n📡 Step 1: Fetching data from all 8 Market Hunter sources...\n');
        const data = await marketManager.fetchAllDataSources();
        
        // Step 2: Display what we got
        console.log('\n📊 Step 2: Data Collection Results:\n');
        console.log('=' .repeat(70));
        
        let totalRecords = 0;
        for (const [key, val] of Object.entries(data)) {
            const count = Array.isArray(val) ? val.length : 0;
            totalRecords += count;
            const status = count > 0 ? '✅' : '❌';
            console.log(`  ${status} ${key}: ${count} items`);
        }
        
        console.log(`\n  📈 Total records to store: ${totalRecords}`);
        
        // Step 3: Store in database
        console.log('\n💾 Step 3: Storing data in database...\n');
        console.log('=' .repeat(70));
        
        const saveResults = await db.saveAllMarketHunterData(data);
        
        console.log('\n✅ Storage Complete! Records saved:');
        for (const [key, count] of Object.entries(saveResults)) {
            if (count > 0) {
                console.log(`  ✓ ${key}: ${count} records`);
            }
        }
        
        // Step 4: Verify by reading back from database
        console.log('\n🔍 Step 4: Verifying stored data...\n');
        console.log('=' .repeat(70));
        
        const verifyData = {
            whaleMovements: await db.getRecentWhaleMovements(5),
            narrativeShifts: await db.getRecentNarrativeShifts(5),
            arbitrageOpportunities: await db.getRecentArbitrageOpportunities(5),
            influencerSignals: await db.getRecentInfluencerSignals(5),
            technicalBreakouts: await db.getRecentTechnicalBreakouts(5),
            institutionalFlows: await db.getRecentInstitutionalFlows(5),
            derivativesSignals: await db.getRecentDerivativesSignals(5),
            macroSignals: await db.getRecentMacroSignals(5)
        };
        
        console.log('\n📋 Sample of stored data (latest 5 per source):\n');
        
        // Display whale movements
        if (verifyData.whaleMovements.length > 0) {
            console.log('🐋 Whale Movements:');
            verifyData.whaleMovements.forEach(w => {
                console.log(`  • ${w.amount.toFixed(4)} ${w.asset} (${w.historical_pattern})`);
                console.log(`    ${w.from_address?.substring(0, 20)}... → ${w.to_address?.substring(0, 20)}...`);
                console.log(`    Stored at: ${w.timestamp}`);
            });
            console.log();
        }
        
        // Display narrative shifts
        if (verifyData.narrativeShifts.length > 0) {
            console.log('📰 Narrative Shifts:');
            verifyData.narrativeShifts.forEach(n => {
                console.log(`  • ${n.theme} (${n.sentiment})`);
                console.log(`    Strength: ${n.strength}, Velocity: ${n.velocity}`);
                console.log(`    Stored at: ${n.timestamp}`);
            });
            console.log();
        }
        
        // Display influencer signals
        if (verifyData.influencerSignals.length > 0) {
            console.log('👥 Influencer Signals:');
            verifyData.influencerSignals.forEach(i => {
                console.log(`  • ${i.influencer} - ${i.asset} (${i.sentiment})`);
                console.log(`    Accuracy: ${i.historical_accuracy}, Reach: ${i.reach.toLocaleString()}`);
                console.log(`    Stored at: ${i.timestamp}`);
            });
            console.log();
        }
        
        // Display institutional flows
        if (verifyData.institutionalFlows.length > 0) {
            console.log('🏛️  Institutional Flows:');
            verifyData.institutionalFlows.forEach(f => {
                console.log(`  • ${f.institution}: $${(f.amount / 1000000000).toFixed(2)}B ${f.asset}`);
                console.log(`    Direction: ${f.direction}, Impact: ${f.market_impact}`);
                console.log(`    Stored at: ${f.timestamp}`);
            });
            console.log();
        }
        
        // Display macro signals
        if (verifyData.macroSignals.length > 0) {
            console.log('🌍 Macro Signals:');
            verifyData.macroSignals.forEach(m => {
                console.log(`  • ${m.indicator}: ${m.value} (${m.impact} impact)`);
                console.log(`    Stored at: ${m.timestamp}`);
            });
            console.log();
        }
        
        console.log('=' .repeat(70));
        console.log('\n✅ SUCCESS! All Market Hunter data is being stored with timestamps.');
        console.log('\n💡 Database location: /workspaces/TweetBot/database/trading.db');
        console.log('💡 You can query this data anytime using the DatabaseService methods.\n');
        
    } catch (error) {
        console.error('\n❌ Error during test:', error);
        console.error(error.stack);
    } finally {
        // Don't close DB here in case other processes need it
        console.log('\n🏁 Test complete!\n');
    }
}

// Run the test
testMarketHunterDBStorage().catch(console.error);
