// ==UserScript==
// @name         UBC course solver
// @namespace    https://courses.students.ubc.ca/
// @version      0.1
// @description  opitimise choosing your courses
// @author       kemkemG0
// @match        https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=sectsearch
// @match        https://courses.students.ubc.ca/cs/courseschedule
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @grant        none
// ==/UserScript==

const main = async () =>{
    console.log('aaa')
    const INPUT_AREA = '<input type="text" style="max-width:80px; max-height:10px;"></input>';
    $('thead tr').prepend(`
    <th>
        <div><button type="button" class="btn btn-warning">UPDATE</button></div>
        Group Name
    </th>`);
    $('tbody tr').prepend(`<td>${INPUT_AREA}</td>`);

    $('div.row-fluid div.span3').append(`
        <div style="margin-top:100px;border:1px dotted gray;border-radius:25% 10%;padding:3px;text-align:center;">
            <h4 style="margin:1px;">Chosen Courses</h4>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>English 10</div>
            <div>
                <button type="button" class="btn btn-success">CREATE</button>
                <button type="button" class="btn btn-danger">CLEAR</button>
            </div>
        </div>
    `)
    
}

main();