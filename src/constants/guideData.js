export const DAILY_PRAYERS = [
  {
    id: 'fajr',
    nameTR: 'Sabah Namazı',
    nameEN: 'Fajr Prayer',
    rakats: '2 Sünnet, 2 Farz',
    stepsTR: [
      'Niyet edilir ve tekbir alınır (Allahu Ekber).',
      'Sübhaneke okunur, Euzü Besmele çekilir, Fatiha ve zamm-ı sure okunur.',
      'Rükuya gidilir (Subhane Rabbiyel Azim 3 kere).',
      'Secdeye gidilir (Subhane Rabbiyel A-la 3 kere).',
      'İkinci rekatta da aynı şeyler yapılır, oturuşta Tahiyyat, Salli-Barik ve Rabbena duaları okunup selam verilir.'
    ]
  },
  {
    id: 'dhuhr',
    nameTR: 'Öğle Namazı',
    nameEN: 'Dhuhr Prayer',
    rakats: '4 İlk Sünnet, 4 Farz, 2 Son Sünnet',
    stepsTR: [
      'Sabah namazı gibi kılınır fakat 4 rekatlıklarda ilk oturuşta sadece Tahiyyat okunur, 3. ve 4. rekatlara kalkılır.'
    ]
  },
  {
    id: 'asr',
    nameTR: 'İkindi Namazı',
    nameEN: 'Asr Prayer',
    rakats: '4 Sünnet, 4 Farz',
    stepsTR: [
      'Öğle namazı gibidir ancak Sünnetinin ilk oturuşunda Salli-Barik de okunur ve 3. rekata kalkınca Sübhaneke okunur.'
    ]
  },
  {
    id: 'maghrib',
    nameTR: 'Akşam Namazı',
    nameEN: 'Maghrib Prayer',
    rakats: '3 Farz, 2 Sünnet',
    stepsTR: [
      '3 rekat farzında ilk 2 rekat normal kılınır, 3. rekatta sadece Fatiha okunur.'
    ]
  },
  {
    id: 'isha',
    nameTR: 'Yatsı Namazı',
    nameEN: 'Isha Prayer',
    rakats: '4 İlk Sünnet, 4 Farz, 2 Son Sünnet, 3 Vitir',
    stepsTR: [
      'Vitir namazının 3. rekatında Fatiha ve zamm-ı sureden sonra tekrar tekbir alınıp Kunut duaları okunur.'
    ]
  }
];

export const NAFILE_PRAYERS = [
  {
    id: 'ishraq',
    nameTR: 'İşrak Namazı',
    nameEN: 'Ishraq Prayer',
    rakats: '2 Rekat',
    stepsTR: ['Güneş doğup kerahet vakti çıktıktan sonra kılınır.']
  },
  {
    id: 'duha',
    nameTR: 'Kuşluk (Duha) Namazı',
    nameEN: 'Duha Prayer',
    rakats: '2 - 12 Rekat',
    stepsTR: ['Kuşluk vaktinde kılınır. Her 2 rekatta bir selam verilmesi efdaldir.']
  },
  {
    id: 'awwabin',
    nameTR: 'Evvabin Namazı',
    nameEN: 'Awwabin Prayer',
    rakats: '2 - 6 Rekat',
    stepsTR: ['Akşam namazından sonra kılınır. Günahlardan tövbe edenlerin namazıdır.']
  },
  {
    id: 'tahajjud',
    nameTR: 'Teheccüd Namazı',
    nameEN: 'Tahajjud Prayer',
    rakats: '2 - 12 Rekat',
    stepsTR: ['Yatsıdan sonra uyuyup uyanınca kılınır. Gecenin son üçte birinde kılmak en faziletlisidir.']
  },
  {
    id: 'hacet',
    nameTR: 'Hacet Namazı',
    nameEN: 'Prayer of Need',
    rakats: '2 veya 4 Rekat',
    stepsTR: [
      'Dünyevî veya uhrevî bir ihtiyacın giderilmesi için kılınır.',
      'Diğer nafile namazlar gibi kılınır.',
      'Selam verdikten sonra:\n\nArapçası: لاَ إِلَهَ إِلاَّ اللَّهُ الحَلِيمُ الكَرِيمُ، سُبْحَانَ اللّٰهِ رَبِّ العَرْشِ العَظِيمِ، الحَمْدُ لِلّٰهِ رَبِّ العَالَمِينَ، أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ وَعَزَائِمَ مَغْفِرَتِكَ وَالغَنِيمَةَ مِنْ كُلِّ بِرٍّ وَالسَّلاَمَةَ مِنْ كُلِّ إِثْمٍ لاَ تَدَعْ لِي ذَنْبًا إِلاَّ غَفَرْتَهُ وَلاَ هَمًّا إِلاَّ فَرَّجْتَهُ وَلاَ حَاجَةً هِيَ لَكَ رِضًا إِلاَّ قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ.\n\nTürkçesi: “Halim ve kerim olan Allah’tan başka ilah yoktur. Büyük arşın Rabbi olan Allah, bütün noksanlıklardan uzaktır. Hamd, âlemlerin Rabbi olan Allah’a mahsustur.\nAllahım! Rahmetine vesile olan ve günahları bağışlamanı gerektiren şeyleri, her türlü iyiliğe kavuşmayı ve her günahtan kurtulmayı senden isterim.\nAllahım! Benim için bağışlamadığın hiçbir günah, sevince çevirmediğin hiçbir üzüntü, senin razı olduğun şeylerden karşılamadığın hiçbir ihtiyaç bırakma.\nEy merhametlilerin en merhametlisi.”\n\nKaynak: (Tirmizî, Vitir, 348 [479]; İbn Mâce, İkâmetü’s-salavât, 189 [1384]).\n\nDuası okunur ve bitirilir.'
    ]
  },
  {
    id: 'istihare',
    nameTR: 'İstihare Namazı',
    nameEN: 'Istikhara Prayer',
    rakats: '2 Rekat',
    stepsTR: [
      'Hakkında hayırlı olup olmadığı bilinmeyen mubah bir işin hayırlı olmasını dilemek veya hayırlı olanı seçebilmek için kılınır.',
      'Selam verdikten sonra:\n\nArapçası: اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ وَتَعْلَمُ وَلاَ أَعْلَمُ وَأَنْتَ عَلَّامُ الغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي - أَوْ قَالَ عَاجِلِ أَمْرِي وَآجِلِهِ - فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي، ثُمَّ بَارِكْ لِي فِيهِ وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي - أَوْ قَالَ فِي عَاجِلِ أَمْرِي وَآجِلِهِ - فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِي الخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي.\n\nTürkçesi: “Ey Allah’ım! Senin ilmine güvenerek senden hakkımda hayırlısını istiyorum ve kudretine sığınarak senden kudret istiyorum ve senin sınırsız lütfundan bana ihsan etmeni istiyorum; çünkü sen, her şeye kadirsin, ben bir şeye kadir değilim. Sen bilirsin, ben bilmem, Sen bilinmeyenleri bilirsin.\nAllah’ım! Senin ezelî ilminde, yapmayı düşündüğüm bu iş benim dinim ve dünyam ve geleceğim açısından hayırlı olacaksa, bu işi benim hakkımda takdir buyur, onu bana kolaylaştır, uğurlu ve bereketli eyle. Eğer bu iş senin ezelî ilminde, benim dinim ve hayatım hakkında ve işimin akıbeti hakkında -erken veya geç olmasında- şerli ise onu benden geri çevir, beni de ondan vazgeçir ve benim için nerede olursa olsun yalnızca hayırlı olanı takdîr et, sonra beni ona râzı kıl.”\n\nKaynak: (Tirmizî, Salât, 349; Buharî, De’avât, 48;).\n\nDuası okunur ve bitirilir.'
    ]
  }
];

export const PRAYER_MOVEMENTS = [
  {
    id: 'qiyam',
    nameTR: 'Kıyam',
    nameEN: 'Qiyam (Standing)',
    descTR: 'Namazda ayakta durmak.',
    zikrTR: 'Sübhaneke, Fatiha ve zamm-ı sure okunur.',
    icon: '🧍'
  },
  {
    id: 'ruku',
    nameTR: 'Rüku',
    nameEN: 'Ruku (Bowing)',
    descTR: 'Eller dizlere konarak eğilinir.',
    zikrTR: 'Subhane Rabbiyel Azim (3 kere)',
    icon: '🙇'
  },
  {
    id: 'secde',
    nameTR: 'Secde',
    nameEN: 'Sujood (Prostration)',
    descTR: 'Alın ve burun yere değecek şekilde kapanılır.',
    zikrTR: 'Subhane Rabbiyel A-la (3 kere)',
    icon: '🤲'
  },
  {
    id: 'kade',
    nameTR: 'Kade (Oturuş)',
    nameEN: 'Tashahhud (Sitting)',
    descTR: 'Dizler üzerine oturulur.',
    zikrTR: 'Tahiyyat, Salli, Barik, Rabbena duaları okunur.',
    icon: '🧎'
  }
];

export const ABLUTION_STEPS = [
  {
    id: 'niyet',
    nameTR: 'Niyet ve Besmele',
    descTR: '"Niyet ettim Allah rızası için abdest almaya" denir ve Euzü Besmele çekilir.',
    icon: '💭'
  },
  {
    id: 'eller',
    nameTR: 'Elleri Yıkamak',
    descTR: 'Eller bileklere kadar 3 kere yıkanır.',
    icon: '🤲'
  },
  {
    id: 'agiz',
    nameTR: 'Ağıza Su Vermek',
    descTR: 'Sağ el ile ağıza 3 kere su verilerek çalkalanır.',
    icon: '👄'
  },
  {
    id: 'burun',
    nameTR: 'Buruna Su Vermek',
    descTR: 'Sağ el ile buruna 3 kere su çekilir, sol el ile temizlenir.',
    icon: '👃'
  },
  {
    id: 'yuz',
    nameTR: 'Yüzü Yıkamak',
    descTR: 'Alın saç bitiminden çene altına kadar yüz 3 kere yıkanır.',
    icon: '😊'
  },
  {
    id: 'kollar',
    nameTR: 'Kolları Yıkamak',
    descTR: 'Önce sağ, sonra sol kol dirseklerle beraber 3 kere yıkanır.',
    icon: '💪'
  },
  {
    id: 'mesh',
    nameTR: 'Başı Meshetmek',
    descTR: 'Eller ıslatılıp başın dörtte biri (veya tamamı) meshedilir.',
    icon: '💆'
  },
  {
    id: 'kulak_boyun',
    nameTR: 'Kulak ve Boyun',
    descTR: 'Kulakların içi ve arkası, ardından boyun meshedilir.',
    icon: '👂'
  },
  {
    id: 'ayaklar',
    nameTR: 'Ayakları Yıkamak',
    descTR: 'Önce sağ, sonra sol ayak topuklarla beraber 3 kere yıkanır.',
    icon: '🦶'
  }
];
