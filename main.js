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

const GROUPED_DATA_KEY = 'groupedData';

const setItem = (data) => {
  localStorage.setItem(GROUPED_DATA_KEY, JSON.stringify(data));
};

const getItem = () => {
  const item = localStorage.getItem(GROUPED_DATA_KEY);
  return item !== null && item !== ''
    ? JSON.parse(localStorage.getItem(GROUPED_DATA_KEY))
    : {};
};

const onUpdate = () => {
  // groupName:[section1,section2,section3...]
  const data = getItem();
  console.log(data);

  console.log('update');
};

const onClear = () => {
  console.log('clear');
  localStorage.setItem(GROUPED_DATA_KEY, '');
};

const onCreate = () => {
  const data = {
    'group name': ['1', '2', '3'],
    'group name 2': ['1', '2', '3'],
    'group name 3': ['1', '2', '3'],
  };
  setItem(data);
  console.log('timetable will be created...');
};

const buttonsOnClickListener = () => {
  document.getElementById('group-name-update').addEventListener('click', onUpdate);
  document.getElementById('create-timetable').addEventListener('click', onCreate);
  document.getElementById('clear-chosen-courses').addEventListener('click', onClear);
};

const main = async () => {
  console.log('aaa');
  const INPUT_AREA = '<input type="text" style="max-width:80px; max-height:10px;"></input>';
  $('thead tr').prepend(`
    <th>
        <div><button type="button" class="btn btn-warning" id="group-name-update">UPDATE</button></div>
        Group Name
    </th>`);
  $('tbody tr').prepend(`<td>${INPUT_AREA}</td>`);
  onUpdate();

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
                <button type="button" class="btn btn-success" id="create-timetable">CREATE</button>
                <button type="button" class="btn btn-danger" id="clear-chosen-courses">CLEAR</button>
            </div>
        </div>
    `);
  buttonsOnClickListener();
};

main();
