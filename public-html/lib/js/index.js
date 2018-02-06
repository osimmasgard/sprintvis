// Medans proxyn används så är baseurlen bakom proxyn: https://kanbanflow.com/api/v1
let baseUrl = 'http://docbrown.ad.tt.se:40400/'
let getListUrl = 'tasks?columnId=56c14004bc8011e6a91f2f180b26adb4&limit=100'
let getUserUrl = 'users'
let getBoardUrl = 'board'

function doHttpCall (url) {
  return new Promise(function (resolve, reject) {
    console.log('lets open: ', url)
    let xhr = new XMLHttpRequest()
    if (xhr) {
      xhr.open('GET', baseUrl + url, true)
      xhr.send()
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText)) // Returning a JSONobject
          else {
            console.error('Statustext:', xhr.statusText)
            reject(xhr.statusText)
          }
        }
      }
    } else console.log('No XHR object')
  })
}

let listOfUsers = doHttpCall(getUserUrl + '?')

let getBoard = doHttpCall(getBoardUrl + '?')

let listOfSwimLaneID = getBoard.then(function (result) {
  let jsonBoard = result
  let temparray = []
  for (let prop of jsonBoard.swimlanes) {
    temparray.push({
      'Namn': prop.name,
      'ID': prop.uniqueId
    })
  }
  return Promise.resolve(temparray)
}).catch(function (rj) {
  console.log('We are here now', rj)
})

let listOfDone = new Promise(function (resolve, reject) {
  listOfSwimLaneID.then(function (result) {
    // we iterate through all swimlanes to get their tasks
    let returnArray = result.map(function (each) {
      return doHttpCall(getListUrl + '&swimlaneId=' + each.ID + '&')
    })
    Promise.all(returnArray).then(function (responseArray) {
      return resolve(responseArray) // Den här resolvar det yttre promise
    }).catch(function (err) {
      console.log('Err', err)
    })
  })
})

function run () {
  Promise.all([listOfUsers, listOfDone, listOfSwimLaneID]).then(function (values) {

    function getSwimlaneName (id) {
      return new Promise(function (resolve, reject) {
        values[2].forEach(elem => {
          if (typeof (elem) !== 'undefined') {
            if (elem.ID === id) {
              resolve(elem.Namn)
            }
          }
        })
      })
    }

    function getCollaborators (collabs) {
      return new Promise(function (resolve, reject) {
        // console.log('asdf', collabs)
        if (typeof (collabs) !== 'undefined') {
          values[0].forEach(elem => {
            collabs.find(function (element) {
              if (elem._id === element.userId) {
                resolve(elem.fullName)
              }
            })
          })
        }
      })
    }

    let flattenedTasks = ([].concat.apply([], values[1])).map(obj => obj.tasks)
    var mergedTasks = [].concat.apply([], flattenedTasks)

    let tasks = mergedTasks.map(task => {
      const swimlanePromise = getSwimlaneName(task.swimlaneId).catch(reason => console.log(reason))
      const collabPromise = getCollaborators(task.collaborators).catch(reason => console.log(reason))
      return Promise.all([swimlanePromise, collabPromise]).then(function (result) {
        const swimlane = result[0]
        const collaborators = result[1]
        return {
          'name': task.name,
          'collaboratorsNames': collaborators,
          'collaboratorsIds': task.collaborators,
          'swimlaneName': swimlane
        }
      })
    })

    // Printing all users in an ordered list
    values[0].forEach(element => {
      if (element.fullName === 'Kanban IT' || element.fullName === 'TT') return
      else {
        $('ol.users').append(' <li id=' + element._id + '>' + JSON.stringify(element.fullName).substr(1).slice(0, -1) + '</li>')
      }
    })

    $('ol.users li').hover(function () {
      $(this).css('cursor', 'pointer')
    })

    //Adding an action for when a user in the list is clicked.
    $('ol.users li').click(function () {
      if (typeof (tasks) != 'undefined') {
        $('ol.users li').removeClass('clickedName')
        $('ol.tasks').html('')
        $(this).addClass('clickedName')
        tasks.forEach(taskProm => {
          taskProm.then(task => {
            task.collaboratorsIds.forEach(x => {
              if ($(this).attr('id') === x.userId) {
                $('ol.tasks').append('<li>' + task.name + '<span class=\'swimlane\'>  ' + task.swimlaneName + '</span></li>')
              }
            })
          }).catch(reason => console.log(reason))
        })
      }
    })

    if (typeof (tasks) != 'undefined') {
      tasks.forEach(taskProm => {
        taskProm.then(task => {
        }).catch(reason => console.log(reason))
      })
    }
  })
}
$(document).ready(run())
