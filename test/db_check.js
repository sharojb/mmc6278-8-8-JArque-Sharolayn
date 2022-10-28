const execSync = require('child_process').execSync;

async function waitForDb() {
  console.log('WAITING FOR MONGO TO START')
  let count = 0
  while(count < 30) {
    try {
      // const answer = execSync('docker exec mysql-sandbox mysql -e "SELECT 1 + 1 AS answer"').toString()
      const answer = execSync(`docker exec mongo-sandbox mongo mongo_blog --eval db`).toString()
      if (answer.match(/\nmongo_blog\n/i))
        break;
    } catch(err) {
      count++
      console.log('WAITING 1 SEC')
      execSync('sleep 1')
    }
  }
  if (count === 30) {
    console.log('\n\nCould not connect to MongoDB')
    process.exit(1)
  }
  execSync('sleep 1')
}

waitForDb()
