const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const xlsx = require('node-xlsx');
// const spawn = require("child_process").spawn;
// const child_process = require('child_process');

const {
    UPLOAD_DICTIONARY_DATA,
    RETURN_DICTIONARY_DATA,
    SAVE_DICTIONARY_DATA,
    UPLOAD_TEXTS_DATA,
    RETURNTEXTSDATA,
    SAVE_DICTIONARY_DATA_RESULT,
    SAVE_TEXTS_DATA,
    SAVE_TEXTS_DATA_RESULT,
    OPEN_MODEL_CONFIG_WINDOW,
    OPEN_DICTIONARY_WINDOW,
    OPEN_TEXT_WINDOW
} = require('./action')
const DictionaryWindow = require('./libs/DictionaryWindow')
const TextWindow = require('./libs/TextWindow')
const ModelConfigWindow = require('./libs/ModelConfigWindow')


exports.newIpcListener = (mainWindow) => {
    /**
     * 上传字典数据
     */
    ipcMain.on(UPLOAD_DICTIONARY_DATA, (event) => {
        // console.log('object');
        const openFilePromise = dialog.showOpenDialog({
            title: '上传字典数据',
            defaultPath: __dirname + '/data',
            filters: [
                {
                    name: 'xls', extensions: ['xls', 'xlsx']
                }
            ],
            properties: ['openFile']
        })
        openFilePromise.then((res) => {
            if (!res.canceled) {
                const dataFile = xlsx.parse(res.filePaths[0])
                data = dataFile[0]['data'].slice(1).map(arr => ({
                    label: arr[0],
                    name: arr[1],
                    abbreviations: [...arr.slice(2)]
                }))
                event.returnValue = {
                    tableData: data,
                    path: res.filePaths[0]
                }
            }
        })
    })
    /**
     * 保存字典数据
     */
    ipcMain.on(SAVE_DICTIONARY_DATA, (event, data) => {
        // console.log(data);
        const saveFilePromise = dialog.showSaveDialog({
            title: '保存字典数据',
            defaultPath: __dirname + '/data' + '/dict.xls',
            filters: [
                {
                    name: 'xls', extensions: ['xls', 'xlsx']
                }
            ],
            properties: ['dontAddToRecent']
        })
        saveFilePromise.then((res) => {
            if (!res.canceled) {
                const configData = [{
                    name: '字典',
                    data: [
                        ['标签', '全称', '别名']
                    ]
                }]
                data.forEach((value) => {
                    configData[0]['data'].push([
                        value['label'], value['name'], ...value['abbreviations']
                    ])
                })
                const buffer = xlsx.build(configData)
                return new Promise((resolve, reject) => {

                    fs.writeFile(res.filePath, buffer, (err) => {
                        if (!err) {
                            resolve('success')
                        }
                        reject('fail')
                    })
                })
            } else {
                return new Promise((resolve, reject) => {
                    resolve('cancel')
                })
            }
        }).then(result => {
            console.log(result)
            // event.reply(SAVE_DICTIONARY_DATA_RESULT, result)
        })
    })
    /**
     * 上传语料数据
     */
    ipcMain.on(UPLOAD_TEXTS_DATA, (event) => {
        // console.log('object');
        const openFilePromise = dialog.showOpenDialog({
            title: '上传语料数据',
            defaultPath: __dirname + '/data',
            filters: [
                {
                    name: 'txt', extensions: ['txt']
                }
            ],
            properties: ['openFile']
        })
        openFilePromise.then((res) => {
            if (!res.canceled) {
                fs.readFile(res.filePaths[0], 'utf-8', (err, data) => {
                    if (err) {
                        throw(err)
                    }
                    const dataByHandle = []
                    lines = data.split("\r\n")
                    lines.forEach((line) => {
                        dataByHandle.push({
                            text: line,
                            label: []
                        });
                    })
                    event.returnValue = {
                        data: dataByHandle,
                        path: res.filePaths[0]
                    }
                })
            }
        })
    })

    /**
     * 保存语料数据
     */
    ipcMain.on(SAVE_TEXTS_DATA, (event, data) => {
        // console.log(data);
        const saveFilePromise = dialog.showSaveDialog({
            title: '保存语料数据',
            defaultPath: __dirname + '/data' + '/texts.json',
            filters: [
                {
                    name: 'json', extensions: ['json']
                }
            ],
            properties: ['dontAddToRecent']
        })
        saveFilePromise.then((res) => {
            if (!res.canceled) {
                // console.log(res)
                return new Promise((resolve, reject) => {
                    fs.writeFile(res.filePath, JSON.stringify(data), 'utf8', (err) => {
                        if (!err) {
                            resolve('success')
                        }
                        reject('fail')
                    })
                })
            } else {
                return new Promise((resolve, reject) => {
                    resolve('cancel')
                })
            }
        }).then(result => {
            // console.log(data)
            event.reply(SAVE_TEXTS_DATA_RESULT, result)
        })
    })
    /**
     * 新建字典数据窗口
     */
    ipcMain.on(OPEN_DICTIONARY_WINDOW, (event, data) => {
        const DictionaryWindowInstance = new DictionaryWindow(mainWindow, data.path)
    })
    /**
     * 新建语料数据窗口
     */
    ipcMain.on(OPEN_TEXT_WINDOW, (event, data) => {
        const TextWindowInstance = new TextWindow(mainWindow, data.path)
    })
    ipcMain.on(OPEN_MODEL_CONFIG_WINDOW, (event, data) => {
        const ModelconfigWindowInstance = new ModelConfigWindow(mainWindow)
    })
}
