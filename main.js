/* eslint-disable max-len */
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

const getValidRow = () => {
  const rows = $('table.section-summary tbody tr');
  return [...Array(rows.length)].map((_, ind) => {
    const row = rows.eq(ind).children();
    return {
      groupName: row.find("input[type='text']").val(),
      courseName: row.eq(2).text(),
      start: row.eq(8).text(),
      end: row.eq(9).text(),
    };
  }).filter((val) => val.groupName !== '');
};

const getItem = () => {
  const item = localStorage.getItem(GROUPED_DATA_KEY);
  return item !== null && item !== '' ? JSON.parse(item) : {};
};
const setItem = (data) => localStorage.setItem(GROUPED_DATA_KEY, JSON.stringify(data));

const drawChosenCourses = () => {
  $('#chosen-courses').empty();
  const savedData = getItem();
  if (JSON.stringify(savedData) === '{}') return;
  Object.keys(savedData).forEach((groupName) => {
    const course = savedData[groupName];
    $('#chosen-courses').append(`<div>${groupName} :      ${course.length} selected</div>`);
  });
};

const onUpdate = () => {
  const savedData = getItem();
  // note: courseName is unique
  getValidRow().forEach((newCourse) => {
    Object.keys(savedData).forEach((savedGroupName) => {
      savedData[savedGroupName] = savedData[savedGroupName].filter((savedCourse) => savedCourse.courseName !== newCourse.courseName);
    });
    if (savedData[newCourse.groupName] === undefined) savedData[newCourse.groupName] = [];
    const { groupName, ...others } = newCourse;
    savedData[groupName].push(others);
  });
  // delete
  Object.keys(savedData).forEach((groupName) => {
    if (savedData[groupName].length === 0) delete savedData[groupName];
  });
  setItem(savedData);
  drawChosenCourses();
};

const onClear = () => {
  setItem({});
  console.log(getItem());
  drawChosenCourses();
};

const onCreate = () => {
  console.log('create');
};

const buttonsOnClickListener = () => {
  document.getElementById('group-name-update').addEventListener('click', onUpdate);
  document.getElementById('create-timetable').addEventListener('click', onCreate);
  document.getElementById('clear-chosen-courses').addEventListener('click', onClear);
};

const createElements = () => {
  const INPUT_AREA = '<input type="text" style="max-width:80px; max-height:10px;"></input>';
  $('thead tr').prepend(`
      <th>
          <div><button type="button" class="btn btn-warning" id="group-name-update">UPDATE</button></div>
          Group Name
      </th>`);
  $('tbody tr').prepend(`<td>${INPUT_AREA}</td>`);
  // create #chosen-courses-area
  $('div.row-fluid div.span3').append(
    `
      <div style="margin-top:100px;border:1px dotted gray;border-radius:10%;padding:3px;text-align:center;transform:translatex(-100px);" id='chosen-courses-area' >
          <h4 style="margin:1px;">Chosen Courses</h4>
          <div id="chosen-courses"></div>
          <div id="create-clear-buttons">
              <button type="button" class="btn btn-success" id="create-timetable">CREATE</button>
              <button type="button" class="btn btn-danger" id="clear-chosen-courses">CLEAR</button>
          </div>
      </div>`,
  );
  drawChosenCourses();
};

const main = async () => {
  createElements();
  buttonsOnClickListener();
};

main();
