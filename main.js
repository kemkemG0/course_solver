/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
// ==UserScript==
// @name         UBC course solver
// @namespace    https://courses.students.ubc.ca/
// @version      0.1
// @description  opitimise choosing your courses
// @author       kemkemG0
// @match        https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=sectsearch*
// @match        https://courses.students.ubc.ca/cs/courseschedule
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @grant        none
// ==/UserScript==

const GROUPED_DATA_KEY = 'groupedData';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const getValidRow = () => {
  const rows = $('table.section-summary tbody tr');
  return [...Array(rows.length)]
    .map((_, ind) => {
      const row = rows.eq(ind).children();
      return {
        groupName: row.find("input[type='text']").val(),
        courseName: row.eq(2).text(),
        days: [0, 1, 2, 3, 4, 5, 6].filter((__, i) => row.eq(7).text().includes(WEEK_DAYS[i])),
        start: row.eq(8).text().split(':').join(''),
        end: row.eq(9).text().split(':').join(''),
      };
    })
    .filter((val) => val.groupName !== '');
};

const getItem = () => {
  const item = localStorage.getItem(GROUPED_DATA_KEY);
  if (item === null || item === '') return {};
  const data = JSON.parse(item);
  Object.keys(data).forEach((group) => {
    data[group].forEach((course, ind) => {
      const { start, end, ...others } = course;
      data[group][ind] = { ...others, start: parseInt(start, 10), end: parseInt(end, 10) };
    });
  });
  return data;
};

const setItem = (data) => {
  const copied = { ...data };
  Object.keys(data).forEach((groupName) => {
    if (data[groupName].length === 0) delete copied[groupName];
  });
  localStorage.setItem(GROUPED_DATA_KEY, JSON.stringify(copied));
};

const deleteCourse = (id) => {
  // delete this from localstorage and rerender "Chosen Courses"
  const newId = id.replace('delete-', 'selected-');
  const groupName = $(`#${newId}`).parents('div')[0].id.replace('group-', '');
  const storedData = getItem();
  storedData[groupName] = storedData[groupName].filter((course) => course.courseName.replaceAll(' ', '') !== id.replace('delete-', ''));
  setItem(storedData);
  renderChosenCourses();
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
  renderChosenCourses();
};

const onClear = () => {
  setItem({});
  render();
};

const onCreate = () => {
  // time is from 00:00 to 24:00
  // 0000 to 2460
  // ready array timetable[7][2460]
  const timeTable = [...Array(7)].map(() => Array(2465).fill(0));
  const savedData = getItem();
  const groupNameList = Object.keys(savedData);
  const tempSelected = {};
  const isTimeTableOK = () => {
    for (let day = 0; day < 7; day += 1) {
      let sum = 0;
      for (let time = 0; time < 2460; time += 1) {
        sum += timeTable[day][time];
        if (sum >= 2) { return false; }
      }
    }
    return true;
  };

  let result;
  const dfs = (currentGroupInd = 0) => {
    if (currentGroupInd === groupNameList.length) {
      result = isTimeTableOK() ? Object.keys(tempSelected).map((key) => tempSelected[key]) : [];
      return;
    }
    const currentGroupCourseList = savedData[groupNameList[currentGroupInd]];
    currentGroupCourseList.forEach((course) => {
    // deciede which course to use
    // Euler Tour(modify => recursion => fix)
      course.days.forEach((day) => {
        timeTable[day][course.start] += 1;
        timeTable[day][course.end] -= 1;
      });
      tempSelected[course.courseName] = { ...course };
      dfs(currentGroupInd + 1);
      course.days.forEach((day) => {
        timeTable[day][course.start] -= 1;
        timeTable[day][course.end] += 1;
      });
      delete tempSelected[course.courseName];
    });
  };
  dfs();
  renderTable(result);
};

const buttonsOnClickListener = () => {
  document.getElementById('group-name-update').addEventListener('click', onUpdate);
  document.getElementById('create-timetable').addEventListener('click', onCreate);
  document.getElementById('clear-chosen-courses').addEventListener('click', onClear);
  $('body').on('click', '.course-accordion-delete-button', (e) => { deleteCourse(e.target.id); });
  $('body').on('hover', '.tt-selcourse-mini', (e) => { console.log(e.target.id); });
};

/*
 * It goes : TERM-TIMESLOT-DAY (e.g. t1-2-0 ,t1-3-0, t1-2-2, t1-3-2, t1-2-4, t1-3-4 where
 * t1-2-0 would be be term 1 - 8:00  (0 is 700, 1 is 730) - Monday (0 is Monday, 1 is Tuesday, etc))
*/
const TIME_SLOT_LIST = [700, 730, 800, 830, 900, 930, 1000, 1030, 1100, 1130, 1200, 1230, 1300, 1330, 1400, 1430, 1500, 1530, 1600, 1630, 1700, 1730, 1800, 1830, 1900, 1930, 2000, 2030];
const time2timeSlot = (time) => TIME_SLOT_LIST.indexOf(time);

const createBaseTable = (term) => {
  let html = `<table><tbody">
    <tr>
      <td class="tt-header-mini">&nbsp;</td>
      <td class="tt-header-mini">Mon</td>
      <td class="tt-header-mini">Tue</td>
      <td class="tt-header-mini">Wed</td>
      <td class="tt-header-mini">Thu</td>
      <td class="tt-header-mini">Fri&nbsp;&nbsp;</td>
    </tr><tr></tr>`;
  TIME_SLOT_LIST.forEach((time, timeSlot) => {
    html += `<tr><td align="center" class="tt-header-mini">${time}</td>`;
    [0, 1, 2, 3, 4].forEach((day) => { html += `<td class="tt-notime-mini" id="new-t${term}-${timeSlot}-${day}">&nbsp;</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
};

const editTimeTable = (tableData) => {
  // change every class to notime
  TIME_SLOT_LIST.forEach((time, timeSlot) => {
    [1, 2].forEach((term) => {
      [0, 1, 2, 3, 4].forEach((day) => {
        const id = `new-t${term}-${timeSlot}-${day}`;
        $(`#${id}`).attr('class', 'tt-notime-mini');
      });
    });
  });
  // ddd color
  tableData.forEach((course) => {
    course.days.forEach((day) => {
      TIME_SLOT_LIST.forEach((time) => {
        if (course.start <= time && time <= course.end) {
          const id = `new-t${1}-${time2timeSlot(time)}-${day}`;
          $(`#${id}`).attr('class', 'tt-selcourse-mini');
          $(`#${id}`).attr('data-hover', course.courseName);
        }
      });
    });
  });
};

const renderTable = (tableData) => {
  editTimeTable(tableData);
};

const renderChosenCourses = () => {
  $('#chosen-courses').empty();
  const savedData = getItem();
  if (JSON.stringify(savedData) === '{}') return;
  Object.keys(savedData).forEach((groupName) => {
    const courseList = savedData[groupName];
    const createAccordion = () => {
      let res = `<details><summary><strong>${groupName} :      ${courseList.length} selected</strong></summary>`;
      courseList.forEach((course) => {
        res += `<div id="selected-${course.courseName.replaceAll(' ', '')}">${course.courseName} <input type="button" value="delete" class="course-accordion-delete-button" id="delete-${course.courseName.replaceAll(' ', '')}" ></div>`;
      });
      res += '</details>';
      return res;
    };
    $('#chosen-courses').append(`
    <div id="group-${groupName}">
        ${createAccordion()}
        </details>
    </div>
`);
  });
};

const render = () => {
  renderChosenCourses();
  renderTable([]);
};

const addGlobalCSS = () => {
  const res = `
  <style>
  div #suggest-timetable table tr td table{
    font-size: 10px;
    line-height: 100%;
    border-collapse: separate !important;
    border-spacing: 2px !important;
    margin: 0;
    padding: 0;
  }
  #suggest-timetable h6, #chosen-courses-area h3 {
    margin: 0;
    padding: 0;
}

  .tt-selcourse-mini:before{
    content: attr(data-hover);
    visibility: hidden;
    opacity: 0;
    width: 140px;
    background-color: midnightblue;
    color: white;
    text-align: center;
    font-size:14px;
    padding: 2px 0;
    transition: opacity 0.3s ease-in-out;
    transform:translate(20px,-20px);
    position: absolute;
    z-index: 10;
  }
  .tt-selcourse-mini:hover:before {
    opacity: 1;
    visibility: visible;
  }
  </style>
  `;
  $('head').prepend(res);
};

const createElements = () => {
  addGlobalCSS();
  const INPUT_AREA = '<input type="text" style="max-width:80px; max-height:10px;"></input>';
  $('thead tr').prepend(`
      <th>
          <div><button type="button" class="btn btn-warning" id="group-name-update">UPDATE</button></div>
          Group Name
      </th>`);
  $('tbody tr').prepend(`<td>${INPUT_AREA}</td>`);
  // create #chosen-courses-area
  $('form[name="sect_srch_criteria_simp_search"]').after(
    `
    <hr />
    <h3>Course Solver</h3>
    <div style="display: flex; justify-content: space-around">
      <div style="margin: auto 0" id="chosen-courses-area">
        <h3 style="margin: 1px">Chosen Courses</h3>
        <div id="chosen-courses"></div>
        <div id="create-clear-buttons">
          <button type="button" class="btn btn-success" id="create-timetable">
            CREATE
          </button>
          <button type="button" class="btn btn-danger" id="clear-chosen-courses">
            CLEAR
          </button>
        </div>
      </div>
      <div id="suggest-timetable">
        <table cellspacing="0" cellpadding="0" border="1">
          <tbody>
            <tr>
              <td class="tt-legend"><h6>Timetable</h6></td>
            </tr>
            <tr>
              <td>
                <table cellpadding="0" border="0" cellspacing="2">
                  <tbody>
                    <tr>
                      <td align="center"><h6>Term 1</h6></td>
                      <td align="center"><h6>Term 2</h6></td>
                    </tr>
                    <tr>
                      <td valign="top">
                        ${createBaseTable(1)}
                        <!---->
                      </td>
                      <td valign="top">
                        ${createBaseTable(2)}
                        <!---->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <hr />
      `,
  );
};

const main = async () => {
  createElements();
  render();
  buttonsOnClickListener();
};

main();
