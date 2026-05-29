const TAX_RATE = 0.08;
const MAX_MONTHLY_HOURS = 744;

const rates = {
  aws: {
    name: 'AWS',
    compute: 0.096,
    storage: 0.023,
    transfer: 0.09
  },
  azure: {
    name: 'Azure',
    compute: 0.102,
    storage: 0.021,
    transfer: 0.087
  },
  gcp: {
    name: 'Google Cloud',
    compute: 0.089,
    storage: 0.026,
    transfer: 0.082
  }
};

const defaults = {
  provider: 'aws',
  region: '1',
  instances: '3',
  hours: '730',
  storage: '500',
  transfer: '250',
  support: '0',
  discount: '10'
};

const form = document.querySelector('#billingForm');
const resetBtn = document.querySelector('#resetBtn');

const fields = {
  provider: document.querySelector('#provider'),
  region: document.querySelector('#region'),
  instances: document.querySelector('#instances'),
  hours: document.querySelector('#hours'),
  storage: document.querySelector('#storage'),
  transfer: document.querySelector('#transfer'),
  support: document.querySelector('#support'),
  discount: document.querySelector('#discount')
};

const output = {
  grandTotal: document.querySelector('#grandTotal'),
  providerNote: document.querySelector('#providerNote'),
  computeRate: document.querySelector('#computeRate'),
  storageRate: document.querySelector('#storageRate'),
  transferRate: document.querySelector('#transferRate'),
  computeCost: document.querySelector('#computeCost'),
  storageCost: document.querySelector('#storageCost'),
  transferCost: document.querySelector('#transferCost'),
  supportCost: document.querySelector('#supportCost'),
  subtotalValue: document.querySelector('#subtotalValue'),
  discountValue: document.querySelector('#discountValue'),
  taxValue: document.querySelector('#taxValue'),
  usageSummary: document.querySelector('#usageSummary')
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function formatRate(value, suffix) {
  return `${formatCurrency(value)}${suffix}`;
}

function toNumber(field, fallback = 0) {
  const value = Number(field.value);
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readUsage() {
  const provider = rates[fields.provider.value] || rates.aws;
  const regionMultiplier = clamp(toNumber(fields.region, 1), 0, 10);
  const instances = clamp(toNumber(fields.instances), 0, 100000);
  const hours = clamp(toNumber(fields.hours), 0, MAX_MONTHLY_HOURS);
  const storage = clamp(toNumber(fields.storage), 0, 100000000);
  const transfer = clamp(toNumber(fields.transfer), 0, 100000000);
  const support = clamp(toNumber(fields.support), 0, 1000000);
  const discountPercent = clamp(toNumber(fields.discount), 0, 100);

  fields.hours.value = String(hours);
  fields.discount.value = String(discountPercent);

  return {
    provider,
    regionMultiplier,
    instances,
    hours,
    storage,
    transfer,
    support,
    discountPercent
  };
}

function calculateBill() {
  const usage = readUsage();
  const adjustedComputeRate = usage.provider.compute * usage.regionMultiplier;
  const adjustedStorageRate = usage.provider.storage * usage.regionMultiplier;
  const adjustedTransferRate = usage.provider.transfer * usage.regionMultiplier;

  const compute = usage.instances * usage.hours * adjustedComputeRate;
  const storage = usage.storage * adjustedStorageRate;
  const transfer = usage.transfer * adjustedTransferRate;
  const subtotal = compute + storage + transfer + usage.support;
  const discount = subtotal * (usage.discountPercent / 100);
  const taxableTotal = subtotal - discount;
  const tax = taxableTotal * TAX_RATE;
  const total = taxableTotal + tax;

  output.computeRate.textContent = formatRate(adjustedComputeRate, '/hr');
  output.storageRate.textContent = formatRate(adjustedStorageRate, '/GB');
  output.transferRate.textContent = formatRate(adjustedTransferRate, '/GB');
  output.computeCost.textContent = formatCurrency(compute);
  output.storageCost.textContent = formatCurrency(storage);
  output.transferCost.textContent = formatCurrency(transfer);
  output.supportCost.textContent = formatCurrency(usage.support);
  output.subtotalValue.textContent = formatCurrency(subtotal);
  output.discountValue.textContent = `-${formatCurrency(discount)}`;
  output.taxValue.textContent = formatCurrency(tax);
  output.grandTotal.textContent = formatCurrency(total);
  output.providerNote.textContent = `Based on ${usage.provider.name} sample rates`;
  output.usageSummary.textContent = `${usage.instances} VM${usage.instances === 1 ? '' : 's'} running ${usage.hours} hours, ${usage.storage} GB storage, and ${usage.transfer} GB transfer.`;
}

function resetCalculator() {
  Object.entries(defaults).forEach(([key, value]) => {
    fields[key].value = value;
  });
  calculateBill();
}

if (form && resetBtn) {
  form.addEventListener('input', calculateBill);
  form.addEventListener('change', calculateBill);
  resetBtn.addEventListener('click', resetCalculator);
  calculateBill();
}
