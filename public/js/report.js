var userId = '';
var period;
window.onload = function (e) {
  liff.init(function (data) {
    //getReportData(data.context.userId)
    userId = data.context.userId
    getReportData(userId)
  });
}
getReportData(userId);
$('#btn-grp-period button').click(function() {
  $(this).addClass('active').siblings().removeClass('active');
  period = $(this).val();

  getReportData(userId, period)
});
function getReportData(userId, period, target){

  let url = "https://lucylinebot.herokuapp.com/report/" + userId + "?";

  if (!period){
    period = "DAY";
  }
  url += "period=" + period;
  if (!target){
    let d = new Date();
    if (period == "DAY"){
      target = d.getDate();
    }
    else if(period == "WEEK"){
      target = 1;
    }
    else if(period == "MONTH"){
      target = d.getMonth() + 1;
    }
    else if(period == "YEAR"){
      target = d.getFullYear();
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
      $('#total-expense').html("Total : " + total)
      var ctx = document.getElementById("pieChart").getContext('2d');
      var config = {
        type: 'pie',
        data: {
          datasets: [{
            data: expenses,
            
            label: 'Dataset 1',
            backgroundColor: palette('tol', expenses.length).map(function(hex) {
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
    }
    else{
      window.alert("No data available")
    }
    if (data && data.raw.length > 0){
      $("#reportTbl-body").empty();
      for (let i in data.raw){
        let no = Number(i) +1;
        let row = "<tr><td>" + no + "</td>" + 
        "<td>"+data.raw[i].category + "</td>" + 
        "<td>" + data.raw[i].expense +"</td>" + 
        "<td>" + formatDate(data.raw[i].timestamp) +"</td>" +
        '<td><button type="button" class="btn btn-primary" onclick=editActOnclick("' + data.raw[i].id +'","' + 
        data.raw[i].category+ '","' + data.raw[i].expense + '","' + formatDate(data.raw[i].timestamp) +
        '")>Edit</button></td>/tr>';
        $("#reportTbl-body").append(row)
      }
    }
  });
}
function editActOnclick(expenseId, category, expense, timestamp){
  $('#modal-popup').modal('show');
  $('#expense-id').val(expenseId);
  $('#catDropDown').html(category);
  $('#modal-expense').val(expense);
  $('#dropdownMenu').empty();
  for (let key in categories){
    let menu = '<button class="dropdown-item" type="button">'+ categories[key].name+ '</button>';
    $('#dropdownMenu').append(menu);
  }
  $('#demo-external').mobiscroll().date({
    showOnTap: false,                 // More info about showOnTap: https://docs.mobiscroll.com/4-4-0/datetime#opt-showOnTap
    showOnFocus: false,               // More info about showOnFocus: https://docs.mobiscroll.com/4-4-0/datetime#opt-showOnFocus
    dateFormat: 'yy/mm/dd',
    onInit: function (event, inst) {  // More info about onInit: https://docs.mobiscroll.com/4-4-0/datetime#event-onInit
        inst.setVal(new Date(timestamp), true);
    }
  });
  $("#dropdownMenu button").click(function () {
    $('#catDropDown').html( this.innerHTML)
    
  });
}
$('#model-edit').click(function(){
  let expenseId = $('#expense-id').val();
  let cost = $('#modal-expense').val();
  let cat = $('#catDropDown').html();
  let timestamp = $('#demo-external').val();
  $.post("https://lucylinebot.herokuapp.com/expense/" + expenseId,
    {
        userId: userId,
        cat: cat,
        cost: cost,
        timestamp: timestamp
    },
    function(){
      $('#modal-popup').modal('hide');
      getReportData(userId, period)
    });
    
});
$('#model-delete').click(function(){
  let expenseId = $('#expense-id').val();
  $.ajax({
    url: "https://lucylinebot.herokuapp.com/expense/" + expenseId,
    type: 'DELETE',
    success: function(result) {
      $('#modal-popup').modal('hide');
      getReportData(userId, period)
    }
});
    
});
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}