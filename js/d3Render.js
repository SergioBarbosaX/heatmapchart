var margin = {
      top: 0,
      right: 50,
      bottom: 130,
      left: 110
    },
    padding = {
      top: 0,
      right: 0,
      bottom: 75,
      left: 75
    },
    outerWidth = 1200,
    outerHeight = 550,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom,
    middle = (width + margin.right - margin.left) / 2;

addPageTitle = () => {
    const title = document.createElement("h1");

    title.innerHTML = "Monthly Global Land-Surface Temperature";
    title.id = "title";

    document.body.appendChild(title);
}

addPageSubtitle = (minYear, maxYear, baseTemperature) => {
    const subtitle = document.createElement("h2");

    subtitle.innerHTML = `${minYear} - ${maxYear} : base temperature ${baseTemperature}ºC`;
    subtitle.id = "description";

    document.body.appendChild(subtitle);
}

addLayout = () => {
    const layout = document.createElement("div");
    layout.id = "layout";

    document.body.appendChild(layout);
}

drawHeatMapChart = (minYear, maxYear, numberTicksAxisX, baseTemperature, monthlyVariance, minVariance, maxVariance) => {

    // Create svg element
    const svg = d3.select("#layout")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    const formatTemperature = d3.format(".1f");
    const roundTemperature = (temperature) => {
      return Math.round(temperature * 10)/10;
    }

    let tooltip = d3.select("#layout")
                      .append("div")
                      .attr("id", "tooltip")
                      .style("opacity", 0);

    // Create X axis scale function
    var xScale = d3.scaleLinear()
                   .domain([minYear, maxYear])
                   .range([0, width]);

    // Define X axis
    var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(numberTicksAxisX)
                  .tickFormat(d3.format(""));

    // Create X axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("id", "x-axis")
       .attr("transform", "translate(0," + (height + height / 12) + ")")
       .call(xAxis);


    // Create Y axis scale function
    var yScale = d3.scaleTime()
                   .domain([12, 1])
                   .range([height, height / 12]);

    // convert number to corresponding month
    var formatTime = d3.timeFormat("%B");
    var formatMonth = (month) => {
      return formatTime(new Date(2012, month - 1));
    };
  
    // Define Y axis
    var yAxis = d3.axisLeft()
                  .scale(yScale)
                  .tickFormat(formatMonth);

    // Create Y axis
    svg.append("g")
       .attr("class", "y axis")
       .attr("id", "y-axis")
       .attr("transform", "translate(0," + (height / 24) + ")")
       .call(yAxis);

    
    // Create color range
    var spectral = ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
        spectral.reverse();
       
    var zScale = d3.scaleQuantile()
                   .domain([minVariance, maxVariance])
                   .range(spectral);
       
    // returns degrees variance for corresponding color
    const colorToValue = (color) => {
      return zScale.invertExtent(color)[0];
    }
       
                     
    // Draw chart cells
    svg.selectAll("rect")
       .data(monthlyVariance)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("data-month", (d, i) => {
          return d.month - 1;
        })
       .attr("data-year", (d, i) => {
          return d.year;
        })
       .attr("data-temp", (d, i) => {
        return baseTemperature + d.variance;
        })
       .attr("x", (d, i) => {
          return xScale(d.year);
        })
       .attr("y", (d, i) => {
          return yScale(d.month);
        })
       .attr("width", (d, i) => {
          return innerWidth / (maxYear - minYear);
        })
       .attr("height", (d, i) => {
          return height / 12;
        })
       .attr("fill", (d, i) => {
          return zScale(d.variance);
        })
       .on("mouseover", (d, i) => {
          tooltip.transition()
                 .duration(300)
                 .style("opacity", 0.90);
          tooltip.html(`<p>${d.year}, ${formatMonth(d.month)}<br>
                        ${formatTemperature(roundTemperature(baseTemperature + d.variance))}℃<br>
                        ${formatTemperature(roundTemperature(d.variance))}℃</p>`)
                 .style("left", (d3.event.pageX - 15) + "px")
                 .style("top", (d3.event.pageY - 120) + "px");
          tooltip.attr("data-year", d.year);
         })
         .on("mouseout", () => {
          tooltip.transition()
                 .duration(300)
                 .style("opacity", 0);
         });

    // X axis label
    svg.append("text")
    .attr("id", "x-label")
    .attr("text-anchor", "right")
    .attr("x", middle + 200)
    .attr("y", height + padding.bottom)
    .text("Years");

    // Y axis label
    svg.append("text")
    .attr("id", "y-label")
    .attr("text-anchor", "middle")
    .attr("y", -padding.left)
    .attr("x", - height / 2)
    .attr("transform", "rotate(-90)")
    .text("Months");

    // Legend
    const legendRectWidth = 40;
    const legendRectHeight = 20;

    const legend = svg.append("g")
                      .attr("id", "legend");

    // Draw legend rect
    legend.selectAll("rect")
          .data(spectral)
          .enter()
          .append("rect")
          .attr("x", (d, i) => {
            return (i * legendRectWidth);
          })
          .attr("y", height + padding.bottom)
          .attr("width", legendRectWidth)
          .attr("height", legendRectHeight)
          .attr("fill", function(d) {
            return d;
          });

    // Draw legend text
    legend.selectAll("text")
          .data(spectral)
          .enter()
          .append("text")
          .attr("x", (d, i) => {
            return (i * legendRectWidth);
          })
          .attr("y", height + padding.bottom + 40)
          .text((d, i) => {
            return formatTemperature(roundTemperature(colorToValue(d) + baseTemperature));
          });
}

addFooter = () => {
    const footer = document.createElement("footer");
    /* layout.id = "layout"; */
    const footerTextPrefix = document.createElement("p");
    footerTextPrefix.innerHTML = "Designed and ";

    const footerSymbol = document.createElement("span");
    footerSymbol.setAttribute("class", "fas fa-code");
    footerTextPrefix.appendChild(footerSymbol);

    const footerTextSuffix = document.createElement("span");
    footerTextSuffix.innerHTML = " by Sergio Barbosa";
    footerSymbol.appendChild(footerTextSuffix);

    footer.appendChild(footerTextPrefix);

    document.body.appendChild(footer);
}

// main program
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then( (jsonData) => {
    
    let minYear = jsonData.monthlyVariance[0].year;
    let maxYear = jsonData.monthlyVariance[jsonData.monthlyVariance.length - 1].year;
    let baseTemperature = jsonData.baseTemperature;
    let numberTicksAxisX = Math.floor((jsonData.monthlyVariance.length / 12 ) / 10);
    let monthlyVariance = jsonData.monthlyVariance;
    let arrVariance = monthlyVariance.map((element) => {
      return element.variance;
    });
    let minVariance = d3.extent(arrVariance)[0];
    let maxVariance = d3.extent(arrVariance)[1];
    
    addPageTitle();
    addPageSubtitle(minYear, maxYear, baseTemperature);
    addLayout();
    drawHeatMapChart(minYear, maxYear, numberTicksAxisX, baseTemperature, monthlyVariance, minVariance, maxVariance);
    addFooter();
});