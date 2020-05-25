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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9291666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.72, 500, 1500, "All Pages"], "isController": false}, {"data": [1.0, 500, 1500, "recruiter-2"], "isController": false}, {"data": [0.885, 500, 1500, "recruiter"], "isController": false}, {"data": [1.0, 500, 1500, "recruiter-0"], "isController": false}, {"data": [1.0, 500, 1500, "company-2"], "isController": false}, {"data": [1.0, 500, 1500, "recruiter-1"], "isController": false}, {"data": [0.87, 500, 1500, "company"], "isController": false}, {"data": [1.0, 500, 1500, "company-0"], "isController": false}, {"data": [1.0, 500, 1500, "company-1"], "isController": false}, {"data": [0.8, 500, 1500, "All Pages-1"], "isController": false}, {"data": [0.975, 500, 1500, "All Pages-0"], "isController": false}, {"data": [0.9, 500, 1500, "All Pages-2"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1200, 0, 0.0, 387.77083333333303, 112, 5346, 164.0, 509.9000000000001, 683.0500000000009, 4914.84, 95.33645825057599, 127.67932067808056, 20.637612218956065], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["All Pages", 100, 0, 0.0, 1372.3600000000004, 394, 5346, 468.0, 5010.900000000001, 5270.349999999999, 5345.95, 8.632596685082873, 22.70415079527797, 3.355247539709945], "isController": false}, {"data": ["recruiter-2", 100, 0, 0.0, 173.06000000000006, 127, 337, 157.5, 247.70000000000007, 308.84999999999997, 336.7999999999999, 15.225334957369062, 23.358399626979296, 2.8547503045066995], "isController": false}, {"data": ["recruiter", 100, 0, 0.0, 479.71999999999997, 382, 665, 464.0, 557.7, 616.0999999999998, 664.5899999999998, 14.570887367040653, 39.587991084438286, 6.830103453300306], "isController": false}, {"data": ["recruiter-0", 100, 0, 0.0, 150.31, 123, 207, 148.0, 174.9, 183.89999999999998, 206.92999999999995, 15.295197308045273, 7.76380630544509, 2.1508871214438665], "isController": false}, {"data": ["company-2", 100, 0, 0.0, 163.87000000000003, 124, 295, 151.0, 208.50000000000003, 252.89999999999998, 294.8499999999999, 15.121729925903523, 23.199450892182064, 2.687651217299259], "isController": false}, {"data": ["recruiter-1", 100, 0, 0.0, 155.82000000000005, 119, 314, 150.5, 179.60000000000002, 219.4999999999999, 313.4099999999997, 15.21838380763963, 10.274638325597323, 2.140085222949323], "isController": false}, {"data": ["company", 100, 0, 0.0, 476.2099999999999, 391, 643, 468.0, 527.8, 569.0499999999997, 642.8299999999999, 14.394702749388225, 38.70052383222974, 6.353911760472146], "isController": false}, {"data": ["company-0", 100, 0, 0.0, 151.4000000000001, 117, 208, 148.5, 176.9, 183.95, 207.92999999999995, 15.16530178950561, 7.5647309580679405, 1.9993317788898999], "isController": false}, {"data": ["company-1", 100, 0, 0.0, 160.42999999999992, 120, 232, 157.0, 199.60000000000002, 203.0, 232.0, 15.117157974300833, 9.909710411942555, 1.992984693877551], "isController": false}, {"data": ["All Pages-1", 100, 0, 0.0, 885.0399999999996, 121, 4037, 160.0, 3894.3, 3916.9, 4036.0199999999995, 9.167583425009166, 5.616845864273928, 1.0653734644297763], "isController": false}, {"data": ["All Pages-0", 100, 0, 0.0, 192.26999999999998, 112, 545, 156.0, 297.20000000000005, 519.6499999999992, 544.8, 8.846426043878273, 4.274447927724699, 1.0280514640835103], "isController": false}, {"data": ["All Pages-2", 100, 0, 0.0, 292.75999999999993, 121, 940, 157.5, 849.0, 896.9, 939.91, 13.987970345502868, 21.460059973422855, 2.185620366484823], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1200, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
