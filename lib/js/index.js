// Medans proxyn används så är baseurlen bakom proxyn: https://kanbanflow.com/api/v1
let baseUrl = "http://docbrown.ad.tt.se:40400/";
let apiToken = "apiToken=beff2156eef4d0da949a4dfa0011eec1";
let getListUrl = "tasks?columnId=56c14004bc8011e6a91f2f180b26adb4&limit=100";
let getPagaendeUrl = "tasks?columnId=56c14002bc8011e6a91f2f180b26adb4&apiToken=beff2156eef4d0da949a4dfa0011eec1"
let getUserUrl = "users";
let getBoardUrl = "board";
let finishedDataObject = {};
let swimlanes = [];

let listOfUsers = new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    if (xhr) {
        xhr.open('GET', baseUrl + getUserUrl + "?" + apiToken, true);
        xhr.send();
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText)); // Returning a JSONobject
                } else {
                    console.error("Statustext:", xhr.statusText);
                    reject(xhr.statusText);
                }
            }
        };
    } else {
        console.log("No XHR object")
    }
});

let getBoard = new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    if (xhr) {
        xhr.open('GET', baseUrl + getBoardUrl + "?" + apiToken, true);
        xhr.send();
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    console.error("Statustext:", xhr.statusText);
                    reject(xhr.statusText);
                }
            }
        };
    } else {
        console.log("No XHR object")
    }

});

let listOfSwimLaneID = new Promise(function (resolve, reject) {
    getBoard.then(function (result) {
        let jsonBoard = JSON.parse(result);
        let temparray = [];
        for (let prop in jsonBoard.swimlanes) {
            temparray.push({
                "Namn": jsonBoard.swimlanes[prop].name,
                "ID": jsonBoard.swimlanes[prop].uniqueId
            })
        }
        resolve(temparray); //Returning an array
    }).catch(function (rj) {
        console.log("We are here now", rj);
    });
});

let listOfDone = new Promise(function (resolve, reject) {
    listOfSwimLaneID.then(function (result) { // här kan vi garanterat fortsätta eftersom vi har alla swimlaneids
        let bla = result.map(function (each) {
            return new Promise(function (res, rej) {
                let xhr = new XMLHttpRequest();
                if (xhr) {
                    xhr.open('GET', baseUrl + getListUrl + "&swimlaneId=" + each.ID + "&" + apiToken, true);
                    xhr.timeout = 5000;
                    xhr.send();
                    xhr.onload = function (e) {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                //console.log("Now adding: ", JSON.parse(xhr.responseText)[0].swimlaneName)
                                return res(JSON.parse(xhr.responseText)[0]);
                            } else {
                                console.error("Statustext:", xhr.statusText);
                                return rej(xhr.statusText);
                            }
                        } else {
                            console.log("No XHR object")
                            return rej(xhr.statusText);
                        }
                    };
                    xhr.ontimeout = function (e) {
                        console.log("Timeout", e);
                        return rej(xhr.statusText);
                    };
                }
            })
        })
        Promise.all(bla).then(function (responseArray) {
            resolve(responseArray); // Den här resolvar det yttre promise
        }).catch(function (err) {
            console.log("Err", err);
        })
    });
});

/* 
{
            "name": z.name,
            "collaborators": "hej",
            "swimlaneid": getSwimlaneName(z.swimlaneId||[]).then(function(values) {
                return values;
            }), function(reason) {
                console.log("FAIL", reason);
                // rejection
              }
        }
 */
function run() {

    Promise.all([listOfUsers, listOfDone, listOfSwimLaneID]).then(function (values) {
        console.log(values[0]);
        values[0].forEach(element => {
            $("ul.users").append(" <li id=" + element._id + ">" + JSON.stringify(element.fullName) + "</li>");
        });

        $("ul.users li").click(function () {
            $(this).append($("<span>" + $(this).attr("id") + "</span>"));
        });

        async function getSwimlaneName(id) {
            return new Promise(function (res, rej) {
                values[2].forEach(elem => {
                    if (elem.ID == id)
                        res(elem.Namn);
                });
            });
        };

        let tasks = values[1].map(x => x.tasks).map(y => y.map(z => {
            return {
                "name": z.name,
                "collaborators": z.collaborators,
                "swimlaneid": getSwimlaneName(z.swimlaneId)
            }
        }));

        let maps = values[1].concat(values[1].tasks);

        tasks.forEach(element => {
            $("ol.tasks").append(" <li>" + JSON.stringify(element) + "</li>");
        });
    });
};




$(document).ready(run());