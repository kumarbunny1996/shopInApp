const { CatalystApp } = require("zcatalyst-sdk-node/lib/catalyst-app");

const getDataFromDb = function getDataFromCatalystDataStore(
  catalystApp,
  query
) {
  return new Promise((resolve, reject) => {
    // Queries the Catalyst Data Store table
    catalystApp
      .zcql()
      .executeZCQLQuery(query)
      .then((queryResponse) => {
        resolve(queryResponse);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getInsertedData = (catalystApp, rowArr, tableName) => {
  return new Promise((resolve, reject) => {
    catalystApp
      .datastore()
      .table(tableName)
      .insertRows(rowArr)
      .then((userInsertResp) => {
        // console.log(userInsertResp);
        resolve(userInsertResp);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const deleteRowData = (catalystApp, tableName, id) => {
  return new Promise((resolve, reject) => {
    let datastore = catalystApp.datastore();
    let table = datastore.table(tableName);
    let rowPromise = table.deleteRow(id);
    rowPromise
      .then((row) => {
        resolve(row);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const updateRow = (catalystApp, tableName, updatedRowData) => {
  return new Promise((resolve, reject) => {
    let datastore = catalystApp.datastore();
    let table = datastore.table(tableName);
    let rowPromise = table.updateRow(updatedRowData);
    rowPromise
      .then((row) => {
        resolve(row);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

//Download the file by passing the file ID to the method which in turn returns a promise
const downloadFile = (catalystApp, fileId, folderId) => {
  return new Promise((resolve, reject) => {
    let filestore = catalystApp.filestore();
    let folder = filestore.folder(folderId);
    let downloadPromise = folder.downloadFile(fileId);
    downloadPromise
      .then((fileObject) => {
        resolve(fileObject);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  getDataFromDb,
  getInsertedData,
  downloadFile,
  deleteRowData,
  updateRow,
};
