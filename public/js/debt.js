var userId = '';
var period = 'MONTH';
var d = new Date();
var tag = ''
window.onload = function (e) {
  liff
  .init({
    liffId: "1653949405-VNlagD7p" // use own liffId
  })
  .then(() => {
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    else{
      liff.getProfile().then(profile => {
        userId = profile.userId;
        $.ajax({
            url: "https://lineexpense-dot-fir-1-4004c.uc.r.appspot.com/debt/" + userId,
            type: 'GET',
            success: populateMethod
        });
      })
    }
  })
  .catch((err) => {
    // Error happens during initialization
    window.alert("Line Login Error: " + err)
  });
}

function getDebtData(){

    let url = "https://lineexpense-dot-fir-1-4004c.uc.r.appspot.com/debtExpense/" + userId + "?";
    
    target = d.getMonth() + 1 + '-' + d.getFullYear();
    $('#select-target').html(d.getFullYear() + '/' + (Number(d.getMonth()) + 1));
    url += "select=" + target + "&tag=" + tag;
    $.get( url, function( res ) {
        
        if (res.success){
            let summary = {};
            let total = 0;
            $("#debtTbl-body").empty();
            for (let i in res.result){
                let no = Number(i) +1;
                let debt = res.result[i].tag || ''
                let row = "<tr><td>" + no + "</td>" + 
                "<td>"+res.result[i].category + "</td>" + 
                "<td>" + numberWithCommas(res.result[i].cost) +"</td>" + 
                "<td>" +  debt +"</td>" + 
                "<td>" + formatDate(res.result[i].timestamp) +"</td>/tr>";
                $("#debtTbl-body").append(row);
                total += parseFloat(res.result[i].cost);
                if (summary[res.result[i].category]){
                    summary[res.result[i].category] += parseFloat(res.result[i].cost);
                }
                else{
                    summary[res.result[i].category] = parseFloat(res.result[i].cost);
                }
            
            }
            let sumStr = 'Total : '+ numberWithCommas(total);
            let detail = '';
            for (let cat in summary){
            detail +=  cat + " : " + numberWithCommas(summary[cat]) + "<br> "
            }
            $('#total-expense').html(sumStr)
            $('#collapase').html(detail)
        }
    });
}
$('#select-target').html(d.getFullYear() + '/' + (Number(d.getMonth()) + 1));
$('#select-left').click(function(){
    d.setMonth(d.getMonth() -1)
    $('#select-target').html(d.getFullYear() + '/' + (Number(d.getMonth()) + 1));
    getDebtData();
  
});
$('#select-right').click(function(){
    d.setMonth(d.getMonth() +1)
    $('#select-target').html(d.getFullYear() + '/' + (Number(d.getMonth()) + 1));
    getDebtData();
});
$('#qrButton').click(function(){
  if (!liff.isInClient()) {
    document.getElementById('qrResult').textContent = "scanCode only work in Line!";
  } else {
      if (liff.scanCode) {
          liff.scanCode().then(result => {
              alert(result)
              // e.g. result = { value: "Hello LIFF app!" }
              const stringifiedResult = JSON.stringify(result);
              document.getElementById('qrResult').textContent = stringifiedResult;
          }).catch(err => {
              document.getElementById('qrResult').textContent = "scanCode failed!!! " + err;
          });
      }
  }
});    
function populateMethod(res){
    if (res.success){
      const result = res.result
      for (let key in result){
        let html = '<button class="btn btn-secondary btn-fix-size" type="button" onclick=setDebt("' + result[key].tag +'")>' + '<i class="fas fa-credit-card"></i>' +
        '<span class="icon-center">' + result[key].tag  + '</span></button>';
        $('#btn-grp-tag').append(html);
      }
    }
  }
function setDebt(debt){
    tag = debt;
    getDebtData();
}