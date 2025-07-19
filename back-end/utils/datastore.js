const fs = require('fs');
const path  = require('path');
const dataPath = path.join(__dirname, 'data', 'data.json');
//Let's initialize the data file
if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath);
}
