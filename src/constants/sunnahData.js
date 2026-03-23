export const SUNNAH_LIST = [
  { tr: "Her hayırlı işe Bismillah ile başlamak", en: "Starting every good deed with Bismillah" },
  { tr: "Yemekten önce ve sonra elleri yıkamak", en: "Washing hands before and after eating" },
  { tr: "Yemeği ve içeceği sağ elle tüketmek", en: "Eating and drinking with the right hand" },
  { tr: "Suyu oturarak ve üç yudumda içmek", en: "Drinking water in three breaths while sitting down" },
  { tr: "Eve girince hane halkına selam vermek", en: "Greeting the household when entering the home" },
  { tr: "Karşılaşılan insanlara ilk selam veren olmak", en: "Being the first to give greeting (salaam) when meeting people" },
  { tr: "İnsanlara tebessüm etmek (Gülümsemek sadakadır)", en: "Smiling at people (Smiling is charity)" },
  { tr: "Namazları cemaatle kılmaya özen göstermek", en: "Taking care to perform prayers in congregation" },
  { tr: "Dişleri temizlemek için misvak veya fırça kullanmak", en: "Using a miswak or brush to clean teeth" },
  { tr: "Tırnakları cuma günleri kesmek", en: "Trimming nails on Fridays" },
  { tr: "Beden ve giysi temizliğine özen göstermek, güzel koku sürmek", en: "Caring for body and clothes hygiene, wearing pleasant fragrance" },
  { tr: "Ayakkabı giymeye sağdan, çıkarmaya soldan başlamak", en: "Starting with the right when putting on shoes, left when taking them off" },
  { tr: "Konuşurken muhatabın yüzüne bakarak konuşmak", en: "Looking at the person's face while talking to them" },
  { tr: "Gereksiz ve boş konuşmalardan (malayani) uzak durmak", en: "Avoiding unnecessary and idle talk" },
  { tr: "Hasta ziyaretinde bulunmak", en: "Visiting the sick" },
  { tr: "Aksırınca 'Elhamdülillah', diyene 'Yerhamükellah' demek", en: "Saying 'Alhamdulillah' when sneezing, 'Yarhamukallah' to the sneezer" },
  { tr: "Büyüklere saygı, küçüklere sevgi göstermek", en: "Showing respect to elders and love to youngsters" },
  { tr: "Komşularla iyi geçinmek ve onlara ikramda bulunmak", en: "Getting along well with neighbors and offering them treats" },
  { tr: "Bir meclise girildiğinde boş bulunan yere oturmak", en: "Sitting in an empty space when entering a gathering" },
  { tr: "Cenaze namazına katılmak ve kabristan ziyaretinde bulunmak", en: "Attending funeral prayers and visiting graveyards" },
  { tr: "Cuma günleri gusül abdesti almak", en: "Performing Ghusl (ritual purification) on Fridays" },
  { tr: "Her gün tevbe ve istiğfar etmek (Estağfirullah)", en: "Repenting and seeking forgiveness daily (Astaghfirullah)" },
  { tr: "Kur'an-ı Kerim okumak ve anlamı üzerinde düşünmek", en: "Reading the Holy Quran and reflecting on its meaning" },
  { tr: "Dua ederken ellerini açıp avuç içlerini semaya yöneltmek", en: "Raising hands with palms facing the sky while supplicating" },
  { tr: "Uykuya abdestli ve sağ tarafının üzerine yatarak dalmak", en: "Going to sleep with Wudu (ablution) and lying on the right side" },
  { tr: "Gece teheccüd namazına kalkmaya gayret etmek", en: "Striving to wake up for the night prayer (Tahajjud)" },
  { tr: "Davete icabet etmek ve hediyeleşmek", en: "Accepting invitations and exchanging gifts" },
  { tr: "Yatmadan önce Felak, Nas, İhlas ve Ayet-el Kürsi okumak", en: "Reciting Al-Falaq, An-Nas, Al-Ikhlas, and Ayatul Kursi before bed" },
  { tr: "Sabah ve akşam dualarını okumayı alışkanlık edinmek", en: "Making it a habit to recite morning and evening supplications" },
  { tr: "Ezan okunurken tekrar etmek ve ezan duasını okumak", en: "Repeating after the Adhan and reciting the Adhan supplication" },
  { tr: "Ayaktayken bir şey yiyip içmekten sakınmak", en: "Avoiding eating or drinking while standing" },
  { tr: "Bir yere girerken izin istemek, kapıyı en fazla üç kez çalmak", en: "Asking permission to enter, knocking thrice at most" },
  { tr: "İşleri istişare ederek (danışarak) yapmak", en: "Doing affairs through consultation (Shura)" },
  { tr: "Namazlardan sonra tesbihat yapmak", en: "Performing Tasbeeh after prescribed prayers" },
  { tr: "Öfkelenince susmak, abdest almak veya pozisyon değiştirmek", en: "Staying silent, performing Wudu, or changing posture when angry" },
  { tr: "Biri seslendiğinde sadece başını değil tüm vücuduyla dönmek", en: "Turning the whole body, not just the head, when called" },
  { tr: "Hayvanlara merhamet etmek ve eziyetten kaçınmak", en: "Showing mercy to animals and avoiding animal cruelty" },
  { tr: "Cömert olmak ve misafire ikram etmek", en: "Being generous and honorable to guests" },
  { tr: "Yemeğe tuz ile başlamak ve tabağı sünnetlemek", en: "Starting meals with a pinch of salt and finishing the plate entirely" },
  { tr: "İnsanların ayıplarını örtmek ve kusurlarını araştırmamak", en: "Concealing people's faults and not seeking out their shortcomings" }
];

// Fisher-Yates shuffle to get exactly 5 random distinct items
export function getRandomSunnahs(count = 5) {
  const array = [...SUNNAH_LIST];
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array.slice(0, count).map((item, i) => ({
    id: `sunnah_${Date.now()}_${i}`,
    tr: item.tr,
    en: item.en,
    done: false
  }));
}
