import { refreshAllSources } from '@/lib/refresh';

async function main() {
  console.log('🔄 Starting manual refresh of all sources...');
  console.log('Time:', new Date().toISOString());

  try {
    const results = await refreshAllSources();
    
    console.log('\n📊 Refresh Summary:');
    console.log('==================');
    
    for (const result of results) {
      const status = result.outcome === 'SUCCESS' ? '✅' : result.outcome === 'PARTIAL_SUCCESS' ? '⚠️' : result.outcome === 'FAILED' ? '❌' : '⏭️';
      console.log(`${status} ${result.sourceId}:`);
      console.log(`   Fetched: ${result.fetchedRecords} | Valid: ${result.validRecords} | Invalid: ${result.invalidRecords}`);
      console.log(`   Snapshots: ${result.createdSnapshots} | Changes: ${result.detectedChanges}`);
      if (result.errorSummary) {
        console.log(`   Error: ${result.errorSummary}`);
      }
    }

    const totalFetched = results.reduce((sum, r) => sum + r.fetchedRecords, 0);
    const totalValid = results.reduce((sum, r) => sum + r.validRecords, 0);
    const totalChanges = results.reduce((sum, r) => sum + r.detectedChanges, 0);
    
    console.log('\n📈 Totals:');
    console.log(`   Total Fetched: ${totalFetched}`);
    console.log(`   Total Valid: ${totalValid}`);
    console.log(`   Total Changes: ${totalChanges}`);
    
    console.log('\n✅ Refresh complete!');
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    process.exit(1);
  }
}

main();