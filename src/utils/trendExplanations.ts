import type { Element } from '../types';

export interface TrendComparison {
  property: string;
  value: number;
  position_in_period: 'left' | 'middle' | 'right';
  position_in_group: 'top' | 'middle' | 'bottom';
  trend_explanation_tr: string;
  trend_explanation_en: string;
}

export function generateTrendExplanations(element: Element): {
  electronegativity_trend_tr: string;
  electronegativity_trend_en: string;
  atomic_radius_trend_tr: string;
  atomic_radius_trend_en: string;
  ionization_energy_trend_tr: string;
  ionization_energy_trend_en: string;
  general_info_tr: string;
  general_info_en: string;
} {
  const period = element.period;
  const group = element.group;

  // Position in period
  let periodPosition: 'left' | 'middle' | 'right' = 'middle';
  if (group && group <= 2) periodPosition = 'left';
  else if (group && group >= 17) periodPosition = 'right';

  // Position in group  
  let groupPosition: 'top' | 'middle' | 'bottom' = 'middle';
  if (period <= 2) groupPosition = 'top';
  else if (period >= 6) groupPosition = 'bottom';

  // Electronegativity trends
  const electronegativity_trend_tr = generateElectronegativityTrend(element, periodPosition, groupPosition);
  const electronegativity_trend_en = generateElectronegativityTrendEn(element, periodPosition, groupPosition);

  // Atomic radius trends
  const atomic_radius_trend_tr = generateAtomicRadiusTrend(element, periodPosition, groupPosition);
  const atomic_radius_trend_en = generateAtomicRadiusTrendEn(element, periodPosition, groupPosition);

  // Ionization energy trends
  const ionization_energy_trend_tr = generateIonizationEnergyTrend(element, periodPosition, groupPosition);
  const ionization_energy_trend_en = generateIonizationEnergyTrendEn(element, periodPosition, groupPosition);

  // General information
  const general_info_tr = generateGeneralInfo(element);
  const general_info_en = generateGeneralInfoEn(element);

  return {
    electronegativity_trend_tr,
    electronegativity_trend_en,
    atomic_radius_trend_tr,
    atomic_radius_trend_en,
    ionization_energy_trend_tr,
    ionization_energy_trend_en,
    general_info_tr,
    general_info_en
  };
}

function generateElectronegativityTrend(element: Element, periodPosition: string, _groupPosition: string): string {
  const period = element.period;
  
  let explanation = `${element.name_tr} elementi ${period}. periyotta yer alır. `;
  
  if (element.electronegativity) {
    if (element.electronegativity >= 3.5) {
      explanation += "Elektronegatifliği çok yüksektir, elektron çekim gücü çok güçlüdür. ";
    } else if (element.electronegativity >= 2.5) {
      explanation += "Elektronegatifliği yüksektir, elektron çekim gücü güçlüdür. ";
    } else if (element.electronegativity >= 1.5) {
      explanation += "Elektronegatifliği orta düzeydedir. ";
    } else {
      explanation += "Elektronegatifliği düşüktür, metal karakteri baskındır. ";
    }
  }

  if (periodPosition === 'left') {
    explanation += "Periyodun sol tarafında bulunduğu için elektronegatifliği düşük eğilim gösterir. ";
  } else if (periodPosition === 'right') {
    explanation += "Periyodun sağ tarafında bulunduğu için elektronegatifliği yüksek eğilim gösterir. ";
  }

  explanation += "Periyotta soldan sağa doğru elektronegatiflik artar, gruptta yukarıdan aşağıya doğru azalır.";

  return explanation;
}

function generateElectronegativityTrendEn(element: Element, periodPosition: string, _groupPosition: string): string {
  const period = element.period;
  
  let explanation = `${element.name_en} is located in period ${period}. `;
  
  if (element.electronegativity) {
    if (element.electronegativity >= 3.5) {
      explanation += "Its electronegativity is very high, with very strong electron attraction. ";
    } else if (element.electronegativity >= 2.5) {
      explanation += "Its electronegativity is high, with strong electron attraction. ";
    } else if (element.electronegativity >= 1.5) {
      explanation += "Its electronegativity is moderate. ";
    } else {
      explanation += "Its electronegativity is low, showing metallic character. ";
    }
  }

  if (periodPosition === 'left') {
    explanation += "Being on the left side of the period, it tends to have low electronegativity. ";
  } else if (periodPosition === 'right') {
    explanation += "Being on the right side of the period, it tends to have high electronegativity. ";
  }

  explanation += "Electronegativity increases from left to right across a period and decreases from top to bottom in a group.";

  return explanation;
}

function generateAtomicRadiusTrend(element: Element, periodPosition: string, _groupPosition: string): string {
  const period = element.period;
  
  let explanation = `${element.name_tr} elementi ${period}. periyotta bulunur. `;
  
  if (element.atomic_radius) {
    if (element.atomic_radius >= 200) {
      explanation += "Atom yarıçapı oldukça büyüktür. ";
    } else if (element.atomic_radius >= 150) {
      explanation += "Atom yarıçapı orta büyüklüktedir. ";
    } else if (element.atomic_radius >= 100) {
      explanation += "Atom yarıçapı küçük-orta büyüklüktedir. ";
    } else {
      explanation += "Atom yarıçapı küçüktür. ";
    }
  }

  if (periodPosition === 'left') {
    explanation += "Periyodun sol tarafında olduğu için büyük atom yarıçapına sahip olma eğilimindedir. ";
  } else if (periodPosition === 'right') {
    explanation += "Periyodun sağ tarafında olduğu için küçük atom yarıçapına sahip olma eğilimindedir. ";
  }

  explanation += "Periyotta soldan sağa doğru atom yarıçapı azalır, gruptta yukarıdan aşağıya doğru artar.";

  return explanation;
}

function generateAtomicRadiusTrendEn(element: Element, periodPosition: string, _groupPosition: string): string {
  const period = element.period;
  
  let explanation = `${element.name_en} is located in period ${period}. `;
  
  if (element.atomic_radius) {
    if (element.atomic_radius >= 200) {
      explanation += "Its atomic radius is quite large. ";
    } else if (element.atomic_radius >= 150) {
      explanation += "Its atomic radius is medium-large. ";
    } else if (element.atomic_radius >= 100) {
      explanation += "Its atomic radius is small-medium. ";
    } else {
      explanation += "Its atomic radius is small. ";
    }
  }

  if (periodPosition === 'left') {
    explanation += "Being on the left side of the period, it tends to have a large atomic radius. ";
  } else if (periodPosition === 'right') {
    explanation += "Being on the right side of the period, it tends to have a small atomic radius. ";
  }

  explanation += "Atomic radius decreases from left to right across a period and increases from top to bottom in a group.";

  return explanation;
}

function generateIonizationEnergyTrend(element: Element, _periodPosition: string, _groupPosition: string): string {
  
  let explanation = `${element.name_tr} elementinin iyonlaşma enerjisi ${element.ionization_energy[0]} eV'dir. `;
  
  if (element.ionization_energy[0] >= 15) {
    explanation += "İyonlaşma enerjisi çok yüksektir, elektron verme eğilimi çok düşüktür. ";
  } else if (element.ionization_energy[0] >= 10) {
    explanation += "İyonlaşma enerjisi yüksektir, elektron verme eğilimi düşüktür. ";
  } else if (element.ionization_energy[0] >= 7) {
    explanation += "İyonlaşma enerjisi orta düzeydedir. ";
  } else {
    explanation += "İyonlaşma enerjisi düşüktür, elektron verme eğilimi yüksektir. ";
  }

  explanation += "Periyotta soldan sağa doğru iyonlaşma enerjisi artar, gruptta yukarıdan aşağıya doğru azalır.";

  return explanation;
}

function generateIonizationEnergyTrendEn(element: Element, _periodPosition: string, _groupPosition: string): string {
  
  let explanation = `The ionization energy of ${element.name_en} is ${element.ionization_energy[0]} eV. `;
  
  if (element.ionization_energy[0] >= 15) {
    explanation += "Its ionization energy is very high, with very low tendency to lose electrons. ";
  } else if (element.ionization_energy[0] >= 10) {
    explanation += "Its ionization energy is high, with low tendency to lose electrons. ";
  } else if (element.ionization_energy[0] >= 7) {
    explanation += "Its ionization energy is moderate. ";
  } else {
    explanation += "Its ionization energy is low, with high tendency to lose electrons. ";
  }

  explanation += "Ionization energy increases from left to right across a period and decreases from top to bottom in a group.";

  return explanation;
}

function generateGeneralInfo(element: Element): string {
  let info = `${element.name_tr} (${element.symbol}) `;
  
  // Category information
  const categoryInfo: { [key: string]: string } = {
    'alkali-metal': 'alkali metal grubu',
    'alkaline-earth-metal': 'toprak alkali metal grubu',
    'transition-metal': 'geçiş metali grubu',
    'post-transition-metal': 'geçiş sonrası metal grubu',
    'metalloid': 'yarımetal grubu',
    'nonmetal': 'ametal grubu',
    'halogen': 'halojen grubu',
    'noble-gas': 'soygaz grubu',
    'lanthanide': 'lantanit grubu',
    'actinide': 'aktinit grubu'
  };

  info += `${categoryInfo[element.category] || element.category}na aittir. `;
  
  if (element.discovery_year && element.discovery_year > 0) {
    info += `${element.discovery_year} yılında keşfedilmiştir. `;
  } else {
    info += "Antik çağlardan beri bilinmektedir. ";
  }

  // Block information
  const blockInfo: { [key: string]: string } = {
    's': 's bloku (s orbital elektronu)',
    'p': 'p bloku (p orbital elektronu)',
    'd': 'd bloku (d orbital elektronu)',
    'f': 'f bloku (f orbital elektronu)'
  };

  info += `${blockInfo[element.block]} elementlerindendir.`;

  return info;
}

function generateGeneralInfoEn(element: Element): string {
  let info = `${element.name_en} (${element.symbol}) `;
  
  // Category information
  const categoryInfo: { [key: string]: string } = {
    'alkali-metal': 'alkali metal',
    'alkaline-earth-metal': 'alkaline earth metal',
    'transition-metal': 'transition metal',
    'post-transition-metal': 'post-transition metal',
    'metalloid': 'metalloid',
    'nonmetal': 'nonmetal',
    'halogen': 'halogen',
    'noble-gas': 'noble gas',
    'lanthanide': 'lanthanide',
    'actinide': 'actinide'
  };

  info += `belongs to the ${categoryInfo[element.category] || element.category} group. `;
  
  if (element.discovery_year && element.discovery_year > 0) {
    info += `It was discovered in ${element.discovery_year}. `;
  } else {
    info += "It has been known since ancient times. ";
  }

  // Block information
  const blockInfo: { [key: string]: string } = {
    's': 's-block (s orbital electrons)',
    'p': 'p-block (p orbital electrons)',
    'd': 'd-block (d orbital electrons)',
    'f': 'f-block (f orbital electrons)'
  };

  info += `It is a ${blockInfo[element.block]} element.`;

  return info;
}