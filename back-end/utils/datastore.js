const fs = require('fs');
const path  = require('path');
const dataPath = path.join(__dirname, 'data', 'data.json');
//Let's initialize the data file
if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath);
}
const userFile = path.join(dataPath, 'users.join');
const resumeFile = path.join(dataPath, 'resumes.join');
//Initialize data files
if(!fs.existsSync(userFile)){
    fs.writeFileSync(userFile, JSON.stringify({ users: {}}, null, 2));
}
if(!fs.existsSync(resumeFile)){
    fs.writeFileSync(resumeFile, JSON.stringify({ resumes: []}, null, 2));

}
//load data from the file
function loadData(){
    return {
        users: JSON.parse(fs.readFileSync(userFile, 'utf8')),
        resume: JSON.parse(fs.readFileSync(resumesFile, 'utf8'))

    };
}
//Save data with backup
function saveData(data){
    try{
        //Create backups
        const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
        fs.copyFileSync(userFile, '${userFile}.bak-${timestamp}');

        //Save new data
        fs.writeFileSync(usersFile, '${userFile}.bak-{timestamp}');
        fs.writeFileSync(resumeFile, JSON.stringify(data.resume, null, 2));
        return true;
    }catch(error){
        console.error('Data save error:', error);
        return false;
    }
    }
    module.exports = { loadData, saveData};
