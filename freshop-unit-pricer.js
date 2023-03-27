const largeUnits = {
"lb": [16, "oz"],
"gal": [128, "fl oz"],
"gl": [128, "fl oz"],
"ltr": [33.814, "fl oz"]
};

const contentFields = ['products', 'fp-products', 'offers-by-savings', 'products-recent']

function parseSale(node, priceTag, insertionTag) {
  const finalUnits = priceTag.match(/[\d.]+/g);
  var finalPrice;
  var numSales = 1;
  const [numUnits, unit] = parseUnit(node.getElementsByClassName('fp-item-size')[0].textContent);
  if (finalUnits.length > 1) {
    numSales = finalUnits[0];
    finalPrice = finalUnits[1];
    addPrice(pricePerUnit(finalPrice, numSales), "unit", insertionTag);
  }
  else {
    finalPrice = finalUnits[0];
  }

  finalPrice = finalPrice / numSales;

  if (numUnits > 1) {
    addPrice(pricePerUnit(finalPrice, numUnits), unit, insertionTag);
  }

  if (largeUnits[unit]) {
    addPrice(pricePerUnit(finalPrice, largeUnits[unit][0]), largeUnits[unit][1], insertionTag);
  }
}

function parseUnit(unitLabel) {
  // console.log(unitLabel);
  const numUnits = unitLabel.replace(/[^\d.]/g, '');
  const unit = unitLabel.replace(/[\d.]/g, '').trim();
  return([numUnits, unit]);
}

function addPrice(price, unit, node) {
  const unitPriceDiv = document.createElement('div');

  unitPriceDiv.textContent = `$${price} / ${unit}`;

  node.appendChild(unitPriceDiv);
  return;
}

function pricePerUnit(price, numUnits) {
  return((price / numUnits).toFixed(2));
}

const observer = new MutationObserver(function (mutations, mutationInstance) {
  // console.log(mutations);
  mutations.forEach(mutation => {
    const node = mutation.addedNodes[mutation.addedNodes.length - 1];
    if (!node?.classList?.contains('fp-container-results')) return;
    const itemsList = node.querySelectorAll('.fp-item-detail');

    var finalPrice;
    itemsList.forEach(item => {
      // console.log(typeof item);
      // const sale = item.getElementsByClassName('fp-item-sale')[0]
      // var priceNode = item.getElementsByClassName('fp-item-sale')[0]
      if (item.querySelector('.fp-item-sale')) {
        // console.log("item on sale");
        parseSale(item, item.getElementsByTagName('strong')[0].textContent, item.getElementsByClassName('fp-item-sale-date')[0]);
      }
      else {
        parseSale(item, item.getElementsByClassName('fp-item-base-price')[0].textContent, item);
      }
    });
  });
});

if (document.getElementById('freshop-js')) {
  // console.log("detected freshop site");
  contentFields.forEach((contentField) => {
    const content = document.getElementById(contentField);
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true
      });
    }
  });
}
