// Medans proxyn används så är baseurlen bakom proxyn: https://kanbanflow.com/api/v1
let baseUrl = "http://docbrown.ad.tt.se:40400/";
let getListUrl = "tasks?columnId=56c14004bc8011e6a91f2f180b26adb4&limit=100&";
let getPagaendeUrl = "tasks?columnId=56c14002bc8011e6a91f2f180b26adb4&"
let getUserUrl = "users";
let getBoardUrl = "board";

let listOfUsers = new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    if (xhr) {
        xhr.open('GET', baseUrl + getUserUrl + "?", true);
        xhr.send();
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) resolve(JSON.parse(xhr.responseText)); // Returning a JSONobject
                else {
                    console.error("Statustext:", xhr.statusText);
                    reject(xhr.statusText);
                }
            }
        }
    } else console.log("No XHR object")
})


let getBoard = new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    if (xhr) {
        xhr.open('GET', baseUrl + getBoardUrl + "?", true);
        xhr.send();
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) resolve(xhr.responseText);
                else {
                    console.error("Statustext:", xhr.statusText);
                    reject(xhr.statusText);
                }
            }
        }
    } else console.log("No XHR object")
});

let listOfSwimLaneID = getBoard.then(function (result) {
    let jsonBoard = JSON.parse(result);
    let temparray = [];
    for (let prop in jsonBoard.swimlanes) {
        temparray.push({
            "Namn": jsonBoard.swimlanes[prop].name,
            "ID": jsonBoard.swimlanes[prop].uniqueId
        })
    }
    return Promise.resolve(temparray); //Returning an array
}).catch(function (rj) {
    console.log("We are here now", rj);
});

let listOfDone = new Promise(function (resolve, reject) {
    listOfSwimLaneID.then(function (result) {
        // we iterate through all swimlanes to get their tasks
        let bla = result.map(function (each) {
            return new Promise(function (res, rej) {
                let xhr = new XMLHttpRequest();
                if (xhr) {
                    xhr.open('GET', baseUrl + getListUrl + "&swimlaneId=" + each.ID + "&", true);
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
            return resolve(responseArray); // Den här resolvar det yttre promise
        }).catch(function (err) {
            console.log("Err", err);
        })
    })
})


function run() {

    Promise.all([listOfUsers, listOfDone, listOfSwimLaneID]).then(function (values) {

        values[0].forEach(element => {
            $("ul.users").append(" <li id=" + element._id + ">" + JSON.stringify(element.fullName) + "</li>");
        });

        $("ul.users li").click(function () {
            $(this).append($("<span>" + $(this).attr("id") + "</span>"));
        });

        function getSwimlaneName(id) {
            return new Promise(function (res, rej) {
                let bla = values[2].forEach(elem => {
                    if (typeof (elem) != "undefined") {
                        if (elem.ID == id) {
                            res(elem.Namn);
                        }
                    }
                })
                /*                 Promise.all(bla).then(function (res) {
                                    return resolve(res); // Den här resolvar det yttre promise
                                }).catch(function (err) {
                                    console.log("Err", err);
                                }) */
            });
        };



        function getCollaborators(collabs) {
            return new Promise(function (res, rej) {
                // console.log("asdf", collabs)
                if (typeof (collabs) != "undefined") {
                    let bla = values[0].forEach(elem => {
                        collabs.find(function (element) {
                            if (elem._id === element.userId) {
                                //console.log("Resolving with", elem.fullName);
                                res(elem.fullName);
                            }
                        })
                    })
                    /*                     Promise.all(bla).then(function (res) {
                                            return resolve(res); // Den här resolvar det yttre promise
                                        }).catch(function (err) {
                                            console.log("Err", err);
                                        }) 
                                        
                                                    if (typeof (z.collaborators) != "undefined")  
            
                                        */
                }
            });
        };

        let flattenedTasks = values[1].map(obj => obj.tasks)
        var merged = [].concat.apply([], flattenedTasks);

        let tasks = merged.map(task => {
            const swimlanePromise = getSwimlaneName(task.swimlaneId).catch(reason => console.log(reason))
            const collabPromise = getCollaborators(task.collaborators).catch(reason => console.log(reason))
            return Promise.all([swimlanePromise, collabPromise]).then(function (result) {
                const swimlane = result[0]
                const collaborators = result[1]
                return {
                    "name": task.name,
                    "collaborators": collaborators,
                    "swimlaneName": swimlane
                }
            })
        })

        if (typeof (tasks) != "undefined") {
            console.log("Tasks", tasks)
            tasks.forEach(taskProm => {
                taskProm.then(task => {
                    $("ol.tasks").append(" <li>" + JSON.stringify(task) + "</li>");
                }).catch(reason => console.log(reason))
            })
        }
    })
}
$(document).ready(run());