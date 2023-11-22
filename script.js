document.getElementById('scrollButton').addEventListener('click', function() {
  var targetSection = document.getElementById('dashboard');

  // Scroll smoothly to the target section
  targetSection.scrollIntoView({ behavior: 'smooth' });
});

// Function to update font size, position, and x based on screen width for a specific chart
function updateLayoutForChart() {
  var w = window.innerWidth;

  // Set different font sizes, position, and x based on screen width
  var tickAngle;

  if (w <= 500) {
    tickAngle = -90;
  } else {
    tickAngle = 0;
  }

  // Update tick angle in the layout for the specific chart with ID 'scatterPlot'
  Plotly.relayout('scatterPlot', {
    'yaxis.tickangle': tickAngle,
  });
}

// Event listener for window resize
window.addEventListener('resize', function () {
  updateLayoutForChart();
});







// Start Chart 3
// URL of the CSV file
var csvURL = './graph_data/studentScatter.csv'; // Replace with the actual URL

d3.csv('./graph_data/studentScatter.csv').then(function(data) {

    var traceGraduateStudents = {
        x: data.map(item => parseFloat(item.Percent_Rent_Bidding)),
        y: data.map(item => parseFloat(item.Num_Grad_Students)),
        text: data.map(item => item.ZIP_Code),
        mode: 'markers',
        type: 'scatter',
        marker: { 
            size: 12,
            color: '#ff6224', 
        },
        name: 'Graduate Students',
        hoverinfo: 'none',
        opacity: 1,
    };

    var traceUndergraduateStudents = {
        x: data.map(item => parseFloat(item.Percent_Rent_Bidding)),
        y: data.map(item => parseFloat(item.Num_Under_Students)),
        text: data.map(item => item.ZIP_Code),
        mode: 'markers',
        type: 'scatter',
        marker: { 
            size: 12,
            color: '#16457f', 
        },
        name: 'Undergraduate Students',
        hoverinfo: 'none',
        opacity: 1,
    };

    var traceAllStudents = {
        x: data.map(item => parseFloat(item.Percent_Rent_Bidding)),
        y: data.map(item => parseFloat(item.Total_students)),
        text: data.map(item => item.ZIP_Code),
        mode: 'markers',
        type: 'scatter',
        marker: { 
            size: 12,
            color: '#69907f', 
        },
        name: 'All Students',
        hoverinfo: 'none',
        opacity: 1,
    };

  // Linear regression calculation for Graduate Students
  var gradXValues = data.map(item => parseFloat(item.Percent_Rent_Bidding));
  var gradYValues = data.map(item => parseFloat(item.Num_Grad_Students));

  var gradXMean = gradXValues.reduce((acc, val) => acc + val, 0) / gradXValues.length;
  var gradYMean = gradYValues.reduce((acc, val) => acc + val, 0) / gradYValues.length;

  var gradNumerator = gradXValues.reduce((acc, val, i) => acc + (val - gradXMean) * (gradYValues[i] - gradYMean), 0);
  var gradDenominator = gradXValues.reduce((acc, val) => acc + Math.pow(val - gradXMean, 2), 0);

  var gradSlope = gradNumerator / gradDenominator;
  var gradIntercept = gradYMean - gradSlope * gradXMean;

  var gradRegressionLine = {
      x: gradXValues,
      y: gradXValues.map(x => gradSlope * x + gradIntercept),
      mode: 'lines',
      type: 'scatter',
      name: 'Graduate Students Regression Line',
      line: {
          color: '#ff6224',
          width: 2,
          dash: 'solid',
      },
      hoverinfo: 'none',
      opacity: 0,
  };

  // Linear regression calculation for Undergraduate Students
  var underXValues = data.map(item => parseFloat(item.Percent_Rent_Bidding));
  var underYValues = data.map(item => parseFloat(item.Num_Under_Students));

  var underXMean = underXValues.reduce((acc, val) => acc + val, 0) / underXValues.length;
  var underYMean = underYValues.reduce((acc, val) => acc + val, 0) / underYValues.length;

  var underNumerator = underXValues.reduce((acc, val, i) => acc + (val - underXMean) * (underYValues[i] - underYMean), 0);
  var underDenominator = underXValues.reduce((acc, val) => acc + Math.pow(val - underXMean, 2), 0);

  var underSlope = underNumerator / underDenominator;
  var underIntercept = underYMean - underSlope * underXMean;

  var underRegressionLine = {
      x: underXValues,
      y: underXValues.map(x => underSlope * x + underIntercept),
      mode: 'lines',
      type: 'scatter',
      name: 'Undergraduate Students Regression Line',
      line: {
          color: '#16457f',
          width: 2,
          dash: 'solid',
      },
      hoverinfo: 'none',
      opacity: 0,
  };

  var layout = {
    showlegend: false,
    paper_bgcolor: '#FBFBFB',
    plot_bgcolor: '#FBFBFB',
    margin: {
        l: 70,
        r: 40,
        b: 40,
        t: 40,
        pad: 0
    },
    animate: true,
    yaxis: {
      title: {'text': 'Students by ZIP Code'},
      range: [0, 5500],
      fixedrange: true,
    },
    xaxis: {
      title: {'text': 'Percent of rent bidding by ZIP Code'},
      fixedrange: true,
    },
    annotations: [
      {
        x: 25.62,
        y: 5000,
        xref: 'x',
        yref: 'y',
        text: 'Allston',
        showarrow: true,
        ax: 0,
        ay: 30,
        arrowhead: 0,
        opacity: 0,
        font: {
          size: 14,
          color: '#262626',
        }
      },
      {
        x: 25.62,
        y: 2690,
        xref: 'x',
        yref: 'y',
        text: 'Allston',
        showarrow: true,
        ax: 0,
        ay: 30,
        arrowhead: 0,
        opacity: 0,
        font: {
          size: 14,
          color: '#262626',
        }
      },
      {
        x: 17.33,
        y: 2693,
        xref: 'x',
        yref: 'y',
        text: 'Brighton',
        showarrow: true,
        ax: 0,
        ay: -30,
        arrowhead: 0,
        opacity: 0,
        font: {
          size: 14,
          color: '#262626',
        }
      },
      {
        x: 11.5,
        y: 2435,
        xref: 'x',
        yref: 'y',
        text: 'Fenway',
        showarrow: true,
        ax: 0,
        ay: -30,
        arrowhead: 0,
        opacity: 0,
        font: {
          size: 14,
          color: '#262626',
        }
      },
      {
        x: 17.65,
        y: 2085,
        xref: 'x',
        yref: 'y',
        text: 'Mission Hill',
        showarrow: true,
        ax: 0,
        ay: -30,
        arrowhead: 0,
        opacity: 0,
        font: {
          size: 14,
          color: '#262626',
        }
      },
      {
        x: 12.96,
        y: 1698,
        xref: 'x',
        yref: 'y',
        text: 'Fenway',
        showarrow: true,
        ax: 0,
        ay: -30,
        arrowhead: 0,
        opacity: 0,
        font: {
          size: 14,
          color: '#262626',
        }
      },
    ],
};

var traces = [traceGraduateStudents, traceUndergraduateStudents, traceAllStudents, gradRegressionLine, underRegressionLine];

Plotly.newPlot('scatterPlot', traces, layout, { displayModeBar: false }, { responsive: true });

// Update the chart layout for mobile
updateLayoutForChart();


// Start scrolling steps

allStudents = d3.selectAll("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(3) > g.points > path")
allStudentsContainer = d3.selectAll("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(3)")
underStudents = d3.selectAll("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(2) > g.points > path")
underStudentsContainer = d3.selectAll("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(2)")
underStudentsRegression = d3.select("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(5)")
gradStudents = d3.selectAll("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(1)")
gradStudentsRegression = d3.select("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(4)")
allstonZip = d3.select("#scatterPlot > div > div > svg:nth-child(1) > g.cartesianlayer > g > g.plot > g > g.trace:nth-child(3) > g.points > path:nth-child(2)");
annot1 = d3.select('.annotation[data-index="0"]');
annot2 = d3.selectAll('.annotation');


allStudents.style('opacity', 0);
underStudents.style('opacity', 0);
gradStudents.style('opacity', 0);


d3.select('#part1').on('stepin', function() {
  allStudents.transition().duration(1000).style('opacity', 0);
  allstonZip.transition().duration(1000).style('opacity', 0);
  underStudents.transition().duration(1000).style('opacity', 0);
  gradStudents.transition().duration(1000).style('opacity', 0);
  });

d3.select('#part2').on('stepout', function(e) {
  if (e.detail.direction === 'up') {
  allStudents.transition().duration(1000).style('opacity', .0);
  allstonZip.transition().duration(1000).style('opacity', 0);
  annot1 = d3.select('.annotation[data-index="0"]');
  annot1.transition().duration(1000).style('opacity', 0);
}});

d3.select('#part2').on('stepin', function() {
  allStudents.transition().duration(1000).style('opacity', .2);
  allstonZip.transition().duration(1000).style('opacity', 1);
  annot1 = d3.select('.annotation[data-index="0"]');
  annot1.transition().duration(1000).style('opacity', 1);
  });

d3.select('#part3').on('stepin', function() {
  allStudents.transition().duration(1000).style('opacity', 1);
  annot1 = d3.select('.annotation[data-index="0"]');
  annot1.transition().duration(1000).style('opacity', 0);
  });


  d3.select('#part4').on('stepin', function(e) {
    if (e.detail.direction === 'down') {
      allStudents.transition().duration(1000).style('opacity', 0);

      setTimeout(function() {
        Plotly.animate('scatterPlot', {
          data: [
            {opacity: 0},
            {opacity: 0},
            {opacity: 0},
            {width: 2},
          ],
          traces: [0, 1, 2, 4],
          layout: {yaxis: {range: [0, 3500]}}
        }, {
          transition: {
            duration: 500,
            easing: 'cubic-in-out'
          },
          frame: {
            duration: 500
          }
        }).then(function() {
          underStudentsContainer.transition().duration(1000).style('opacity', 1);
          underStudentsRegression.transition().duration(1000).style('opacity', 1);
        });
      }, 1000);
    }
  });
  

  d3.select('#part4').on('stepout', function(e) {
    if (e.detail.direction === 'up') {
      underStudents.transition().duration(1000).style('opacity', 0);
      underStudentsRegression.transition().duration(1000).style('opacity', 0);
  
      setTimeout(function() {
        Plotly.animate('scatterPlot', {
          data: [
            {opacity: 0},
            {opacity: 0},
            {opacity: 0},
          ],
          traces: [0, 1, 2],
          layout: {yaxis: {range: [0, 5500]}}
        }, {
          transition: {
            duration: 500,
            easing: 'cubic-in-out'
          },
          frame: {
            duration: 500
          }
        }).then(function() {
          allStudentsContainer.transition().duration(1000).style('opacity', 1);
        });
      }, 1000);
    }
  });

  d3.select('#part5').on('stepout', function(e) {
    if (e.detail.direction === 'up') {
    gradStudents.transition().duration(1000).style('opacity', 0);
    gradStudentsRegression.transition().duration(1000).style('opacity', 0);
    }});

  d3.select('#part5').on('stepin', function() {
    gradStudents.transition().duration(1000).style('opacity', 1);
    gradStudentsRegression.transition().duration(1000).style('opacity', 1);
  });

  d3.select('#part7').on('stepout', function(e) {
    if (e.detail.direction === 'up') {
    underStudents.transition().duration(1000).style('opacity', 1);
    underStudentsRegression.transition().duration(1000).style('opacity', 1);
    }});

  d3.select('#part7').on('stepin', function() {
    underStudents.transition().duration(1000).style('opacity', 0);
    underStudentsRegression.transition().duration(1000).style('opacity', 0);
    annot2 = d3.selectAll('.annotation');
    annot2.transition().duration(1000).style('opacity', 0);
  });

  d3.select('#part8').on('stepin', function() {
    annot2 = d3.selectAll('.annotation');
    annot2.transition().duration(1000).style('opacity', 1);
  });

  d3.select('#part9').on('stepin', function() {
    annot2 = d3.selectAll('.annotation');
    annot2.transition().duration(1000).style('opacity', 0);
  });

});

