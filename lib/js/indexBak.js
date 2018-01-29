    /* 
             "name": element.name,
            "collaborators": element._id,
            "swimlanename": "hej",
            //"swimlanename": values[2].find(function (element) {
            //    return element.ID == y.swimlaneId


            {
        "name": z.name,
        "collaborators": z.collaborators,
        "swimlaneid": z.swimlaneId
    }
values[0].find(function (element) {
                return element._id == z.collaborators || [].map(a => a.userId) || []
            }) || [],

    values[0].find(function (element) {
            return z.collaborators||[].find(a => a.userId == element._id)})
            z.collaborators||[].find(a => a.userId == "0f0c71244a4dd2203111f10b342b02de"),
            values[0].find(a => a._id ==
                values[0].find(function (element) {element._id == z.collaborators||[].map(a=> a.userId)||[]})||[]




        function getSwimlaneName2(id) {
            values[2].forEach(function (element) {
                if (element.ID == id) {
                    console.log("MATCH", element.ID, element.Namn);
                    return element.Namn;
                }
            });
        };

        //        console.log("Swimmas", getSwimlaneName2("cc5b3320d27e11e6887a5b446cb51bd5"));

        //      console.log(getSwimlaneName("cc5b3320d27e11e6887a5b446cb51bd5").then(function(value){return value}));
        console.log("out", getSwimlaneName("cc5b3320d27e11e6887a5b446cb51bd5").then(x => {
            console.log(x);
        }));





                */



// Medans proxyn används så är baseurlen bakom proxyn: https://kanbanflow.com/api/v1
var baseUrl = "http://docbrown.ad.tt.se:40400/";
var apiToken = "apiToken=beff2156eef4d0da949a4dfa0011eec1";
var getListUrl = "tasks?columnId=56c14004bc8011e6a91f2f180b26adb4&limit=100&swimlaneId=56c14005bc8011e6a91f2f180b26adb4";
var getPagaendeUrl = "tasks?columnId=56c14002bc8011e6a91f2f180b26adb4&apiToken=beff2156eef4d0da949a4dfa0011eec1"
var getUserUrl = "users";
var getBoardUrl = "board";
var finishedDataObject = {};
var swimlanes = [];

var listOfDone = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    console.log("Getting tasklist of column klart", xhr);
    if (xhr) {
        xhr.open('GET', baseUrl + getListUrl + "&" + apiToken, true);
        xhr.send();
        xhr.onload = function (e) {
            console.log("Readystate:", xhr.readyState);
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


var listOfUsers = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    console.log("Getting userlist", xhr);
    if (xhr) {
        xhr.open('GET', baseUrl + getUserUrl + "?" + apiToken, true);
        xhr.send();
        xhr.onload = function (e) {
            console.log("Readystate:", xhr.readyState);
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

var getTaskByUser = new Promise(function (userid, columnid) {


});

var getBoard = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    console.log("Getting swimlaneIDs", xhr);
    if (xhr) {
        xhr.open('GET', baseUrl + getBoardUrl + "?" + apiToken, true);
        xhr.send();
        xhr.onload = function (e) {
            console.log("Readystate:", xhr.readyState);
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

var listOfSwimLaneID = new Promise(function (resolve, reject) {
    getBoard.then(function (result) {
        var jsonBoard = JSON.parse(result);
        var temparray = [];
        for (var prop in jsonBoard.swimlanes) {
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

function getTaskName(id) {
    if (id == "23b63af32bf53f4b9c7b5aebb67af4c1") {
        return true;
    } else
        return false;
}

function asdf(id) {
    return listOfSwimLaneID.then(function (result) {
        result.find(function (element) {
            if (element.ID === id)
                console.log(element.ID, id, element.Namn);
            return element.Namn;
        });
    });
}

function run() {

    Promise.all([listOfUsers, listOfDone, listOfSwimLaneID]).then(function (values) {

        //$("ul.users").append(" <li>" + JSON.stringify(values[1]) + "</li>");

        values[0].forEach(element => {
            $("ul.users").append(" <li id=" + element._id + ">" + JSON.stringify(element.fullName) + "</li>");
        });

        // Here is the main attraction, after clicking a persons name their tasks (that are in the "klart"-column will show)
        // We must be able to search the listOfDone for tasks where this person is marked as collaborator
        // Array of tasks
        // Array of objects with taskname and swimlane

        $("ul.users li").click(function () {
            //values[2].filter(getTaskName($(this).attr("id")));
            $(this).append($("<span>" + $(this).attr("id") + "</span>"));

        });

        function getSwimlaneName(id) {
            values[2].find(function (element) {
                console.log("!ASdfasdfa", element.ID, id);
                return element.ID == id
            });
        }



        let tasksPerSwimlane = values[1].map(x => x.tasks).map(x => x.map(y => ({
            "name": y.name,
           // "collaborators": (y.collaborators || []).map(x => x.userId),
           "collaborators": Array(y.collaborators).length,
            "swimlanename": values[2].find(function (element) {
                return element.ID == y.swimlaneId
            })
        })));


        let tasks = values[1].map(x => x.tasks).map(x => x.map(y => ({
            "name": y.name,
           // "collaborators": (y.collaborators || []).map(x => x.userId),
           "collaborators": Array(y.collaborators).length,
            "swimlanename": values[2].find(function (element) {
                return element.ID == y.swimlaneId
            })
        })));

        tasks.forEach(element => { //Each entry is per swimlane
            $("ol.tasks").append(" <li>" + JSON.stringify(element) + "</li>");
        });




        /* 
        values[1].map(x => x.tasks).map(x => x.map(y => {
                return Promise.resolve()
                    .then(() => {
                        return getSwimlaneName(y.swimlaneId)
                    })
                    .then(swinlaneName => {
                        return {
                            "name": y.name,
                            "collaborators": y.collaborators,
                            "swimlaneid": swinlaneName
                        };
                    })
            }))
            .next(tasks => {
                console.log(tasks);
            })




        // values[0].find(function (element) {
        //    if (y.collaborators.find(function (element2) { if (element == element2) });)
        //    return element.Name;

        //console.log("Tasks:",JSON.stringify(values[2]));
        //console.log("Tasks:",values[2]);


   
                return Promise.resolve(values[1])
                    .then(doneList => {
                        return values[1].map(x => x.tasks).map(x => x.map(y => {
                            return Promise.resolve()
                                .then(() => {
                                    return getSwimlaneName(y.swimlaneId)
                                })
                                .then(swinlaneName => {
                                    return {
                                        "name": y.name,
                                        "collaborators": y.collaborators,
                                        "swimlaneid": swinlaneName
                                    };
                                })
                    }))})
                    .then(tasks => {
                        Promise.all(tasks).then(function (values) {
                            console.log(values);
                    })});

                    console.log("nu jämför vi:", element.ID, "med", y.swimlaneId);

                    (values[0].find(function (element) {
                y.collaborators.forEach(function (element2){
                    if(element2.userId === element._id)
                         console.log(element.fullName)
                        return element.fullName;
                }) 
            }))
eval( if (y.collaborators != "undefined") return y.collaborators) ,
            if(typeof y.collaborators != "undefined") y.collaborators.map(x=> x.userId),
(y.collaborators).map(x=>x.u serId)
                         */


        /*         values[0].forEach(item => {
                    $("ul.swimlanes").append(" <li>" + JSON.stringify(item) + "</li>");
                });
         */

        //console.log(JSON.stringify(values));
    });

    /*     getSwimLaneID.then(function (result) {
            console.log(result.length);
            result.forEach(item => {
                $("ul.swimlanes").append(" <li>" + item + "</li>");
            });
        });

        listOfDone.then(function (result) {
            var jsonTasks = JSON.parse(result);
            /*  jsonTasks.tasks.forEach(element => {
                    document.write("Klart", element.name + "<br>");
                });
     

                for (var prop in jsonTasks) {
                    if (jsonTasks.hasOwnProperty(prop)) {
                        $("ul.tasks").append(" <li>" + JSON.stringify(jsonTasks[prop]) + "</li>");
                        //document.write("Property: <br>", JSON.stringify(jsonTasks[prop]) + "<br><br>");
                    }
                }
            
        }).catch(function (rj) {
            console.log("We are here now", rj);
        });

        listOfUsers.then(function (result) {
            var jsonUsers = JSON.parse(result);
            jsonUsers.forEach(element => {
                //document.write(JSON.stringify(element));    
                //document.write(element.fullName + "<br>");
            });
        }).catch(function (rj) {
            console.log("We are here now", rj);
        });
     */
}



$(document).ready(run());