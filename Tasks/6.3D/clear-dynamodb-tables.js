const { DynamoDBClient, ScanCommand, BatchWriteItemCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "ap-southeast-2" });

async function clearTable(tableName) {
    console.log(`🗑️  Clearing table: ${tableName}`);
    
    try {
        let itemsDeleted = 0;
        let lastEvaluatedKey = undefined;
        
        // Discover the table's key schema so we delete with the correct key attributes
        const describe = await client.send(new DescribeTableCommand({ TableName: tableName }));
        const keyAttributes = describe.Table.KeySchema.map(k => k.AttributeName);

        do {
            // Scan the table
            const scanParams = {
                TableName: tableName,
                ExclusiveStartKey: lastEvaluatedKey,
                Limit: 25 // DynamoDB batch write limit
            };
            
            const scanResult = await client.send(new ScanCommand(scanParams));
            
            if (scanResult.Items && scanResult.Items.length > 0) {
                // Prepare delete requests
                const deleteRequests = scanResult.Items.map(item => {
                    // Build the Key using the actual key attributes from the table
                    const key = keyAttributes.reduce((acc, attrName) => {
                        if (item[attrName] !== undefined) {
                            acc[attrName] = item[attrName]; // low-level client expects AttributeValue map
                        }
                        return acc;
                    }, {});

                    // Safety: if we couldn't build a complete key, skip this item
                    if (Object.keys(key).length !== keyAttributes.length) {
                        console.warn(`Skipping item without full key for ${tableName}. Expected keys: ${keyAttributes.join(', ')}`);
                        return null;
                    }

                    return { DeleteRequest: { Key: key } };
                }).filter(Boolean);
                
                // Batch delete
                const batchParams = {
                    RequestItems: {
                        [tableName]: deleteRequests
                    }
                };
                
                if (deleteRequests.length > 0) {
                    await client.send(new BatchWriteItemCommand(batchParams));
                    itemsDeleted += deleteRequests.length;
                    console.log(`  ✅ Deleted ${deleteRequests.length} items (Total: ${itemsDeleted})`);
                }
                
                // Handle pagination
                lastEvaluatedKey = scanResult.LastEvaluatedKey;
            } else {
                lastEvaluatedKey = undefined;
            }
            
        } while (lastEvaluatedKey);
        
        console.log(`✅ Cleared ${tableName}: ${itemsDeleted} items deleted\n`);
        
    } catch (error) {
        console.error(`❌ Error clearing ${tableName}:`, error.message);
    }
}

async function clearAllTables() {
    console.log('🧹 Starting DynamoDB cleanup...\n');
    
    const tables = ['LightCommands', 'LightStates'];
    
    for (const table of tables) {
        await clearTable(table);
        // Small delay between tables
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 DynamoDB cleanup complete!');
    console.log('Ready for next test run.');
}

// Run the cleanup
clearAllTables().catch(console.error);
