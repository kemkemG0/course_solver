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
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getValidRow = () => {
  const rows = $('table.section-summary tbody tr');
  return [...Array(rows.length)].map((_, ind) => {
    const row = rows.eq(ind).children();
    return {
      groupName: row.find("input[type='text']").val(),
      courseName: row.eq(2).text(),
      days: [0, 1, 2, 3, 4, 5, 6, 7].filter((__, i) => row.eq(7).text().includes(WEEK_DAYS[i])),
      start: row.eq(8).text().split(':').join(''),
      end: row.eq(9).text().split(':').join(''),
    };
  }).filter((val) => val.groupName !== '');
};

const getItem = () => {
  const item = localStorage.getItem(GROUPED_DATA_KEY);
  if (item !== null && item !== '') {
    const data = JSON.parse(item);

    Object.keys(data).forEach((group) => {
      data[group].forEach((course, ind) => {
        const { start, end, ...others } = course;
        data[group][ind] = { ...others, start: parseInt(start, 10), end: parseInt(end, 10) };
      });
    });
    return data;
  }
  return {};
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
  Object.keys(savedData).forEach((groupName) => {
    if (savedData[groupName].length === 0) delete savedData[groupName];
  });
  setItem(savedData);
  drawChosenCourses();
};

const onClear = () => {
  setItem({});
  drawChosenCourses();
};

const onCreate = () => {
  console.log('create');
  // time is from 00:00 to 24:00
  // 0000 to 2460
  // ready array timetable[7][2460]
  const timeTable = [...Array(7)].map(() => Array(2465).fill(0));
  const savedData = getItem();
  const groupNameList = Object.keys(savedData);
  const check = () => {
    for (let day = 0; day < 7; day += 1) {
      let sum = 0;
      for (let time = 0; time < 2460; time += 1) {
        sum += timeTable[day][time];
        if (sum >= 2) {
          return false;
        }
      }
    }
    return true;
  };
  const dfs = (currentGroupInd = 0) => {
    if (currentGroupInd === groupNameList.length) {
      const msg = check() ? 'ok' : 'ng';
      console.log(msg);
      return;
    }
    const currentGroupCourseList = savedData[groupNameList[currentGroupInd]];
    currentGroupCourseList.forEach((course) => {
    // deciede which course to use
      course.days.forEach((day) => {
        timeTable[day][course.start] += 1;
        timeTable[day][course.end] -= 1;
      });
      dfs(currentGroupInd + 1);
      course.days.forEach((day) => {
        timeTable[day][course.start] -= 1;
        timeTable[day][course.end] += 1;
      });
    });
  };
  dfs();
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
      <div style="margin-top:100px;border:1px dotted gray;border-radius:10%;padding:3px;text-align:center;transform:translate(-80px,150px);" id='chosen-courses-area' >
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
