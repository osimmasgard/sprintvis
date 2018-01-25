// Medans proxyn används så är baseurlen bakom proxyn: https://kanbanflow.com/api/v1
var baseUrl = "http://docbrown.ad.tt.se:40400/";
var apiToken = "apiToken=beff2156eef4d0da949a4dfa0011eec1";
var getListUrl = "tasks?columnId=56c14004bc8011e6a91f2f180b26adb4&limit=100";
var getPagaendeUrl = "tasks?columnId=56c14002bc8011e6a91f2f180b26adb4&apiToken=beff2156eef4d0da949a4dfa0011eec1"
var getUserUrl = "users";
var getBoardUrl = "board";
var finishedDataObject = {};
var swimlanes = [];

var listOfUsers = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
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

var getBoard = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
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

var listOfDone = new Promise(function (resolve, reject) {
    listOfSwimLaneID.then(function (result) {
        let responseArray = [];
        console.log(result.length);
        new Promise(function (resolve, reject) {
            result.forEach(function (each) {
            //console.log(each);
                var xhr = new XMLHttpRequest();
                if (xhr) {
                    document.write("opening:", baseUrl + getListUrl + "&swimlaneId=" + each.ID + "&" + apiToken + "<br><br>");
                    xhr.open('GET', baseUrl + getListUrl + "&swimlaneId=" + each.ID + "&" + apiToken, true);
                    xhr.timeout = 5000;
                    xhr.send();
                    xhr.onload = function (e) {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                console.log("Now adding: ", JSON.parse(xhr.responseText)[0].swimlaneName)
                                console.log("Now adding: ", JSON.parse(xhr.responseText)[0])
                                responseArray.push(JSON.parse(xhr.responseText)[0]);
                            } else {
                                console.error("Statustext:", xhr.statusText);
                                reject(xhr.statusText);
                            }
                        } else {
                            reject(xhr.statusText);
                            console.log("No XHR object")
                        }
                    };
                    xhr.ontimeout = function (e) {
                        console.log("Timeout", e);
                    };
                }
            })
            resolve(responseArray);
        }).then(function (values) {
            console.log("Alla valuse", values);
            resolve(responseArray);
        });
    });
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
            values[2].find(function (element) {
                console.log("!ASdfasdfa", element.ID, id);
                return element.ID == id
            });
        }
        console.log("values[0]", values[0].length);
        console.log("values[1]", values[1].length);
        console.log("values[2]", values[2].length);

        console.log("values[0]", values[0]);
        console.log("values[1]", values[1]);

        values[1].forEach(function (elem) {
            console.log("tasks", elem);
        });






        /*         let tasks = values[1].map(x => x.tasks).map(y => ({
                    "name": y.name,
                    "collaborators": y.collaborators,
                    "swimlanename": "hej"
                    /* "swimlanename": values[2].find(function (element) {
                        return element.ID == y.swimlaneId
                    }) 
                }));
         */

        //  tasks.forEach(element => { 
        //      $("ol.tasks").append(" <li>" + JSON.stringify(element) + "</li>");
        //  });
    });
}



$(document).ready(run());