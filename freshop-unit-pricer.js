const largeUnits = {
"lb": [16, "oz"],
"gal": [128, "fl oz"],
"gl": [128, "fl oz"],
"gll": [128, "fl oz"],
"gallon": [128, "fl oz"],
"ltr": [33.814, "fl oz"],
"l": [33.814, "fl oz"],
"lt": [33.814, "fl oz"],
"Liters": [33.814, "fl oz"]
};

const contentFields = ['products', 'fp-products', 'offers-by-savings', 'products-recent', 'weekly-ad']

const badUnits = ['ct', 'ea', 'pk', 'case']

const priceRegex = new RegExp(/([\d.]+[\/]?[\d.]?)[ ]?([A-Za-z]+(?: oz)?)$/);

function parseSale(node, priceTag, insertionTag) {
  const finalUnits = priceTag.match(/[\d.]+/g);
  let finalPrice;
  let numSales = 1;
  const [numUnits, unit] = parseUnit(node);
  if (finalUnits.length > 1) {
    numSales = finalUnits[0];
    finalPrice = finalUnits[1];
    addPrice(pricePerUnit(finalPrice, numSales), "unit", insertionTag);
  }
  else {
    finalPrice = finalUnits[0];
  }

  finalPrice = finalPrice / numSales;

  if (numUnits != 1) {
    finalPrice = pricePerUnit(finalPrice, numUnits);
    addPrice(finalPrice, unit, insertionTag);
  }

  if (largeUnits[unit]) {
    addPrice(pricePerUnit(finalPrice, largeUnits[unit][0]), largeUnits[unit][1], insertionTag);
  }
}

function parseUnit(unitLabel) {
  // console.log(unitLabel);
  extractUnitsFromNameInstead = false;
  let numUnits = 1;
  let unit;
  try {
    priceTag = unitLabel.getElementsByClassName('fp-item-size')[0].textContent;
    // console.log(priceTag);
    const parseTag = priceTag.match(priceRegex);
    // console.log(parseTag);

    if (parseTag) {
      numUnits = parseTag[1];
      unit = parseTag[2];
    } else {
      unit = priceTag;
    }
    if ((numUnits == 1 && badUnits.includes(unit))) {
      extractUnitsFromNameInstead = true;
    }
  } catch (TypeError) {
    console.log("Item has no units");
    extractUnitsFromNameInstead = true;
  }

  if (extractUnitsFromNameInstead) {
    const parseName = unitLabel.getElementsByClassName('fp-item-name')[0].textContent.trim().match(priceRegex);
    // console.log(parseName);
    if (parseName && parseName[0] != 1) {
      numUnits = parseName[1];
      unit = parseName[2];
    }
  }
  // console.log(numUnits);
  if (typeof numUnits == 'string' && numUnits.includes('/')) {
    numUnits = numUnits.split('/');
    numUnits = numUnits[0] / numUnits[1];
  }

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
    // console.log(node);
    if (!node?.classList?.contains('container-fluid')) return;
    const itemsList = node.querySelectorAll('.fp-item-detail');

    itemsList.forEach(item => {
      // console.log(typeof item);
      // const sale = item.getElementsByClassName('fp-item-sale')[0]
      // let priceNode = item.getElementsByClassName('fp-item-sale')[0]
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
    // console.log(content);
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true
      });
    }
  });
}
