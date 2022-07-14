// ==UserScript==
// @name         UBC course solver
// @namespace    https://courses.students.ubc.ca/
// @match        https://courses.students.ubc.ca/*
// @version      0.1
// @description  opitimise choosing your courses
// @author       kemkemG0
// @match        https://stackoverflow.com/questions/53511974/javascript-fetch-failed-to-execute-json-on-response-body-stream-is-locked
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @grant        none
// ==/UserScript==

const main = async () =>{
    const INPUT_AREA = '<input type="text" style="max-width:80px; max-height:10px;"></input>';
    $('thead tr').prepend(`<th>Group Name</th>`);
    $('tbody tr').prepend(`<td>${INPUT_AREA}</td>`);
}

main();