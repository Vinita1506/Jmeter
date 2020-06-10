/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.15522107243650046, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Flight Search"], "isController": true}, {"data": [0.23833333333333334, 500, 1500, "\/cgi-bin\/welcome.pl-16"], "isController": false}, {"data": [0.195, 500, 1500, "\/cgi-bin\/welcome.pl-24"], "isController": false}, {"data": [0.13, 500, 1500, "\/cgi-bin\/reservations.pl-18"], "isController": false}, {"data": [0.185, 500, 1500, "\/cgi-bin\/welcome.pl-11"], "isController": false}, {"data": [0.0, 500, 1500, "Flight Search-2"], "isController": true}, {"data": [0.0, 500, 1500, "Login"], "isController": true}, {"data": [0.245, 500, 1500, "\/cgi-bin\/login.pl-14"], "isController": false}, {"data": [0.09, 500, 1500, "\/cgi-bin\/reservations.pl-21"], "isController": false}, {"data": [0.1772300469483568, 500, 1500, "\/cgi-bin\/reservations.pl-22"], "isController": false}, {"data": [0.1772300469483568, 500, 1500, "Reservation"], "isController": true}, {"data": [0.245, 500, 1500, "\/cgi-bin\/login.pl-13"], "isController": false}, {"data": [0.2, 500, 1500, "\/cgi-bin\/nav.pl-17"], "isController": false}, {"data": [0.16, 500, 1500, "\/cgi-bin\/nav.pl-25"], "isController": false}, {"data": [0.2275, 500, 1500, "\/cgi-bin\/nav.pl-15"], "isController": false}, {"data": [0.055, 500, 1500, "Registration"], "isController": false}, {"data": [0.2275, 500, 1500, "\/cgi-bin\/nav.pl-12"], "isController": false}, {"data": [0.055, 500, 1500, "Sign-up"], "isController": true}, {"data": [0.13, 500, 1500, "\/cgi-bin\/reservations.pl-20"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3226, 0, 0.0, 1631.1487910725389, 160, 3743, 1622.0, 2107.3, 2262.6499999999996, 2624.46, 29.70752909974952, 63.27458082777737, 18.67381711762837], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Flight Search", 211, 0, 0.0, 8447.398104265407, 6369, 10351, 8406.0, 9508.2, 9847.0, 10324.72, 2.492616656822209, 31.35003276358535, 7.823505795924394], "isController": true}, {"data": ["\/cgi-bin\/welcome.pl-16", 300, 0, 0.0, 1531.5699999999997, 728, 3138, 1517.5, 1909.8000000000002, 2080.45, 2357.4500000000007, 3.7847248505033684, 3.115769805149749, 1.9404106899553402], "isController": false}, {"data": ["\/cgi-bin\/welcome.pl-24", 100, 0, 0.0, 1572.5200000000002, 762, 2355, 1554.5, 1912.7, 2043.9, 2354.0699999999997, 1.584208608589579, 1.6894099615037308, 0.8833819487350094], "isController": false}, {"data": ["\/cgi-bin\/reservations.pl-18", 300, 0, 0.0, 1761.4200000000003, 926, 3409, 1744.0, 2242.000000000001, 2400.1499999999996, 2788.9500000000007, 3.72079178449174, 16.42380748623307, 1.9221668496055961], "isController": false}, {"data": ["\/cgi-bin\/welcome.pl-11", 200, 0, 0.0, 1571.4299999999994, 607, 2464, 1567.0, 1959.6, 2078.8, 2419.98, 1.9845995078193224, 2.116389318885449, 0.968073685698976], "isController": false}, {"data": ["Flight Search-2", 89, 0, 0.0, 8351.47191011236, 6776, 9909, 8321.0, 9392.0, 9549.0, 9909.0, 1.1526257851453734, 14.496745592663341, 3.617714134235576], "isController": true}, {"data": ["Login", 200, 0, 0.0, 7634.819999999997, 5929, 9637, 7615.0, 8591.0, 8833.6, 9107.09, 1.876753591637186, 12.674501428678672, 4.698298664220632], "isController": true}, {"data": ["\/cgi-bin\/login.pl-14", 200, 0, 0.0, 1536.2600000000007, 835, 2727, 1510.0, 1958.2, 2082.65, 2234.83, 1.9739439399921042, 2.224706144517371, 0.464570790564548], "isController": false}, {"data": ["\/cgi-bin\/reservations.pl-21", 300, 0, 0.0, 1782.5066666666667, 766, 2599, 1763.0, 2240.8, 2373.85, 2466.0, 3.7671404892259783, 11.202092568059673, 2.7959245818474057], "isController": false}, {"data": ["\/cgi-bin\/reservations.pl-22", 426, 0, 0.0, 1602.589201877935, 160, 2821, 1670.0, 2173.9, 2283.65, 2626.73, 5.638276752034941, 15.55481623486202, 5.367778439547349], "isController": false}, {"data": ["Reservation", 426, 0, 0.0, 1602.589201877935, 160, 2821, 1670.0, 2173.9, 2283.65, 2626.73, 5.6383513778224845, 15.555022111668475, 5.367849485136459], "isController": true}, {"data": ["\/cgi-bin\/login.pl-13", 200, 0, 0.0, 1508.45, 853, 2279, 1510.5, 1864.2, 1978.9999999999998, 2157.6400000000003, 1.9735933213602006, 1.994928944472952, 1.3973194902208452], "isController": false}, {"data": ["\/cgi-bin\/nav.pl-17", 300, 0, 0.0, 1599.0566666666668, 708, 2625, 1594.5, 2032.5000000000002, 2143.65, 2416.3500000000004, 3.7627463031017574, 6.426800082153294, 1.9401660625368435], "isController": false}, {"data": ["\/cgi-bin\/nav.pl-25", 100, 0, 0.0, 1591.3300000000004, 926, 2226, 1608.5, 1897.1000000000001, 2123.749999999998, 2225.47, 1.5949217690872262, 2.9385031808721034, 0.7990184253337375], "isController": false}, {"data": ["\/cgi-bin\/nav.pl-15", 200, 0, 0.0, 1507.25, 590, 2415, 1539.5, 1950.3, 2078.3999999999996, 2392.3700000000017, 1.98400888835982, 3.388818931908815, 0.990066935499871], "isController": false}, {"data": ["Registration", 100, 0, 0.0, 2103.52, 1056, 3743, 2150.5, 2690.2, 2729.1, 3734.5899999999956, 1.6725484620916893, 4.70249086893074, 1.2396948801200889], "isController": false}, {"data": ["\/cgi-bin\/nav.pl-12", 200, 0, 0.0, 1511.4299999999996, 914, 2670, 1518.0, 1840.3000000000002, 1935.3999999999999, 2147.3600000000006, 1.9887634863023913, 3.661509735618754, 1.1400431313081092], "isController": false}, {"data": ["Sign-up", 100, 0, 0.0, 2103.5199999999995, 1056, 3743, 2150.5, 2690.2, 2729.1, 3734.5899999999956, 1.6607985119245334, 4.669455034918289, 1.2309858032867202], "isController": true}, {"data": ["\/cgi-bin\/reservations.pl-20", 300, 0, 0.0, 1744.386666666667, 958, 2951, 1750.5, 2198.3, 2265.75, 2567.7700000000004, 3.731064845907022, 9.917928232967688, 3.1772349078426982], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3226, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
