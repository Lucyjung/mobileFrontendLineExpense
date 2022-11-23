var userId = '';
var period = 'DAY';
let curDate = new Date();
window.onload = function (e) {
  liff
  .init({
    liffId: "1560734038-YOd34GKJ" // use own liffId
  })
  .then(() => {
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    else{
      liff.getProfile().then(profile => {
        userId = profile.userId;
        getReportData(userId);
      })
    }
    
  })
  .catch((err) => {
    // Error happens during initialization
    window.alert("Line Login Error: " + err)
  });
}
$('#btn-grp-period button').click(function() {
  $(this).addClass('active').siblings().removeClass('active');
  period = $(this).val();
  let target
  let newDate
  if (period == "DAY"){
    curDate.setDate(curDate.getDate())
    newDate = curDate.getFullYear() + '/' + Number(curDate.getMonth() + 1) + '/' + curDate.getDate();
    target = curDate.getFullYear() + String(Number(curDate.getMonth() + 1)).padStart(2,'0') + String(curDate.getDate()).padStart(2,'0');
  }
  else if(period == "WEEK"){
    target = 1;
  }
  else if(period == "MONTH"){
    curDate.setMonth(curDate.getMonth())
    newDate = curDate.getFullYear() + '/' + Number(curDate.getMonth() + 1)
    target = curDate.getFullYear() + String(Number(curDate.getMonth() + 1)).padStart(2,'0');
  }
  else if(period == "YEAR"){
    curDate.setFullYear(curDate.getFullYear())
    newDate = curDate.getFullYear()
    target = curDate.getFullYear()
  }
  $('#select-target').html(newDate);
  getReportData(userId, period, target)
});
function getReportData(userId, period, target){

  let url = "https://lineexpense-dot-fir-1-4004c.uc.r.appspot.com/report/" + userId + "?";

  if (!period){
    period = "DAY";
  }
  url += "period=" + period;
  if (!target){
    let d = new Date();
    if (period == "DAY"){
      target = d.getDate();
      $('#select-target').html(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' +target);
    }
    else if(period == "WEEK"){
      target = 1;
    }
    else if(period == "MONTH"){
      target = d.getMonth() + 1;
      $('#select-target').html(d.getFullYear() + '/' + (Number(d.getMonth()) + 1));
    }
    else if(period == "YEAR"){
      target = d.getFullYear();
      $('#select-target').html(d.getFullYear());
    }
    
  }
  url += "&select=" + target;
  $.get( url, function( data ) {
    if (data && data.sum.length > 0){
      let label = [];
      let expenses = [];
      let total = 0;
      for (let i in data.sum){
        label.push(data.sum[i].label);
        expenses.push(data.sum[i].value)
        total += data.sum[i].value;
      }
      $('#pieChart').remove();
      $('#pieContainer').append('<canvas id="pieChart"></canvas>');
      var ctx = document.getElementById("pieChart").getContext('2d');
      var config = {
        type: 'pie',
        data: {
          datasets: [{
            data: expenses,
            label: 'Expense',
            backgroundColor: palette('tol-dv', expenses.length).map(function(hex) {
              return '#' + hex;
            })
          }],
          labels: label
        },
        options: {
          responsive: true
        }
      };
      window.myPie = new Chart(ctx, config);
      if (data.raw.length > 0){
        let barData = []
        let barLabel = []
        let rawGroupedData = _.groupBy(data.raw, function (ele) {
          let eDate = new Date(ele.timestamp)
          if (period == "YEAR") {
            return eDate.getFullYear() + "." + Number(eDate.getMonth()+1)
          } else {
            return eDate.getFullYear() + "." + Number(eDate.getMonth()+1) + "." + eDate.getDate()
          }
          
        });
        barLabel = Object.keys(rawGroupedData)
        for (let i in rawGroupedData){
          barData.push(_.sumBy(rawGroupedData[i], function(o) { return o.expense; }))
        }
        $('#barChart').remove();
        $('#barContainer').append('<canvas id="barChart"></canvas>');
        var barctx = document.getElementById("barChart").getContext('2d');
        var barconfig = {
          type: 'bar',
          data: {
            datasets: [{
              label: 'Expense',
              data: barData,
              backgroundColor: '#000084'
            }],
            labels: barLabel
          },
          options: {
            responsive: true
          }
        };
        window.myBar = new Chart(barctx, barconfig);
      }
    }
    else{
      window.alert("No data available")
    }
    if (data && data.raw.length > 0){
      let summary = {};
      let total = 0;
      $("#reportTbl-body").empty();
      for (let i in data.raw){
        let no = Number(i) +1;
        let tag = data.raw[i].tag || ''
        let row = "<tr><td>" + no + "</td>" + 
        "<td>"+data.raw[i].category + "</td>" + 
        "<td>" + numberWithCommas(data.raw[i].expense) +"</td>" + 
        "<td>" +  tag +"</td>" + 
        "<td>" + formatDate(data.raw[i].timestamp) +"</td>" +
        '<td><button type="button" class="btn btn-primary" onclick=editActOnclick("' + data.raw[i].id +'","' + 
        data.raw[i].category+ '","' + data.raw[i].expense + '","' + formatDate(data.raw[i].timestamp) + '","' + tag +
        '")>Edit</button></td>/tr>';
        $("#reportTbl-body").append(row);
        total += parseFloat(data.raw[i].expense);
        if (summary[data.raw[i].category]){
          summary[data.raw[i].category] += parseFloat(data.raw[i].expense);
        }
        else{
          summary[data.raw[i].category] = parseFloat(data.raw[i].expense);
        }
        
      }
      let sumStr = 'Total : '+ numberWithCommas(total);
      let detail = '';
      for (let cat in summary){
        detail +=  cat + " : " + numberWithCommas(Number(summary[cat])) + "<br> "
      }
      $('#total-expense').html(sumStr)
      $('#collapase').html(detail)
    }
  });
}
$('#select-target').html(formatDate(null))
$('#select-left').click(function(){
  // let current = $('#select-target').html();
  // let dateArr = current.split('/');
  // let newValue = parseInt(dateArr[dateArr.length -1]) - 1;
  // if(newValue != 0){
  //   dateArr[dateArr.length -1] = newValue;
  //   let newDate = dateArr.join('/');
  //   $('#select-target').html(newDate);
  //   getReportData(userId, period,newValue);
  // }
  let target
  let newDate = ""
  if (period == "DAY"){
    curDate.setDate(curDate.getDate() - 1)
    newDate = curDate.getFullYear() + '/' + Number(curDate.getMonth() + 1) + '/' + curDate.getDate();
    target = curDate.getFullYear() + String(Number(curDate.getMonth() + 1)).padStart(2,'0') + String(curDate.getDate()).padStart(2,'0');
  }
  else if(period == "WEEK"){
    target = 1;
  }
  else if(period == "MONTH"){
    curDate.setMonth(curDate.getMonth() - 1)
    newDate = curDate.getFullYear() + '/' + Number(curDate.getMonth() + 1)
    target = curDate.getFullYear() + String(Number(curDate.getMonth() + 1)).padStart(2,'0');
  }
  else if(period == "YEAR"){
    curDate.setFullYear(curDate.getFullYear() - 1)
    newDate = curDate.getFullYear()
    target = curDate.getFullYear()
  }
  $('#select-target').html(newDate);
  getReportData(userId, period,target);
});
$('#select-right').click(function(){
  // let current = $('#select-target').html();
  // let dateArr = current.split('/');
  // let newValue = parseInt(dateArr[dateArr.length -1]) + 1;
  // if((period == 'DAY') && (newValue < 32) ||
  //     (period == 'MONTH') && (newValue < 13)
  // ){
  //   dateArr[dateArr.length -1] = newValue;
  //   let newDate = dateArr.join('/');
  //   $('#select-target').html(newDate);
  //   getReportData(userId, period,newValue);
  // }
  let target
  let newDate = ""
  if (period == "DAY"){
    curDate.setDate(curDate.getDate() + 1)
    newDate = curDate.getFullYear() + '/' + Number(curDate.getMonth() + 1) + '/' + curDate.getDate();
    target = curDate.getFullYear() + Number(curDate.getMonth() + 1) + curDate.getDate();
  }
  else if(period == "WEEK"){
    target = 1;
  }
  else if(period == "MONTH"){
    curDate.setMonth(curDate.getMonth() + 1)
    newDate = curDate.getFullYear() + '/' + Number(curDate.getMonth() + 1)
    target = curDate.getFullYear() + Number(curDate.getMonth() + 1)
  }
  else if(period == "YEAR"){
    curDate.setFullYear(curDate.getFullYear() + 1)
    newDate = curDate.getFullYear()
    target = curDate.getFullYear()
  }
  $('#select-target').html(newDate);
  getReportData(userId, period,target);
});
function editActOnclick(expenseId, category, expense, timestamp, tag){
  $('#modal-popup').modal('show');
  $('#expense-id').val(expenseId);
  $('#catDropDown').html(category);
  $('#modal-expense').val(expense);
  $('#modal-tag').val(tag);
  $('#dropdownMenu').empty();
  for (let key in categories){
    let menu = '<button class="dropdown-item" type="button">'+ categories[key].name+ '</button>';
    $('#dropdownMenu').append(menu);
  }
  $('#modal-calendar').datepicker({
    format: 'yyyy/mm/dd',
    container: '#modalContainer',
  });
  $('#modal-calendar').datepicker('setValue', formatDate(timestamp))

  $("#dropdownMenu button").click(function () {
    $('#catDropDown').html( this.innerHTML)
    
  });
}
$('#model-edit').click(function(){
  let expenseId = $('#expense-id').val();
  let cost = $('#modal-expense').val();
  let cat = $('#catDropDown').html();
  let timestamp = $('#modal-calendar').val();
  let tag = $('#modal-tag').val();
  $.post("https://lineexpense-dot-fir-1-4004c.uc.r.appspot.com/expense/" + expenseId,
    {
        userId: userId,
        cat: cat,
        cost: cost,
        timestamp: timestamp,
        tag: tag
    },
    function(){
      $('#modal-popup').modal('hide');
      getReportData(userId, period)
    });
    
});
$('#model-delete').click(function(){
  let expenseId = $('#expense-id').val();
  $.ajax({
    url: "https://lineexpense-dot-fir-1-4004c.uc.r.appspot.com/expense/" + expenseId,
    type: 'DELETE',
    success: function(result) {
      $('#modal-popup').modal('hide');
      getReportData(userId, period)
    }
});
    
});
