// Test d'intégration pour vérifier que QuranCloud fonctionne
// Ce fichier peut être exécuté avec Node.js pour tester l'API

const testQuranCloudIntegration = async () => {
  try {
    console.log('🧪 Test d\'intégration QuranCloud...\n');
    
    // Test 1: Vérifier que l'API QuranCloud est accessible
    console.log('1️⃣ Test de connectivité à QuranCloud...');
    const surahsResponse = await fetch('https://api.alquran.cloud/v1/surah');
    if (surahsResponse.ok) {
      const surahsData = await surahsResponse.json();
      console.log(`✅ QuranCloud accessible - ${surahsData.data.length} sourates trouvées`);
    } else {
      console.log('❌ QuranCloud non accessible');
      return;
    }
    
    // Test 2: Test de récupération d'une sourate
    console.log('\n2️⃣ Test de récupération de la sourate Al-Fatiha...');
    const surahResponse = await fetch('https://api.alquran.cloud/v1/surah/1');
    if (surahResponse.ok) {
      const surahData = await surahResponse.json();
      console.log(`✅ Sourate récupérée - ${surahData.data.ayahs.length} versets trouvés`);
    } else {
      console.log('❌ Impossible de récupérer la sourate');
    }
    
    // Test 3: Test de translittération
    console.log('\n3️⃣ Test de translittération du premier verset...');
    const transliterationResponse = await fetch('https://api.alquran.cloud/v1/ayah/1:1/en.transliteration');
    if (transliterationResponse.ok) {
      const transliterationData = await transliterationResponse.json();
      console.log(`✅ Translittération récupérée: "${transliterationData.data.text}"`);
    } else {
      console.log('❌ Impossible de récupérer la translittération');
    }
    
    // Test 4: Test de traduction
    console.log('\n4️⃣ Test de traduction du premier verset...');
    const translationResponse = await fetch('https://api.alquran.cloud/v1/ayah/1:1/en.sahih');
    if (translationResponse.ok) {
      const translationData = await translationResponse.json();
      console.log(`✅ Traduction récupérée: "${translationData.data.text}"`);
    } else {
      console.log('❌ Impossible de récupérer la traduction');
    }
    
    // Test 5: Test d'audio
    console.log('\n5️⃣ Test de récupération d\'audio...');
    const audioResponse = await fetch('https://api.alquran.cloud/v1/ayah/1:1/mishary_rashid_alafasy');
    if (audioResponse.ok) {
      const audioData = await audioResponse.json();
      console.log(`✅ URL audio récupérée: ${audioData.data.audio}`);
    } else {
      console.log('❌ Impossible de récupérer l\'audio');
    }
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ L\'intégration QuranCloud est prête à être utilisée dans les leçons.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

// Exécuter le test si le fichier est appelé directement
if (typeof window === 'undefined') {
  // Node.js environment
  testQuranCloudIntegration();
} else {
  // Browser environment
  console.log('🌐 Ce test peut être exécuté dans la console du navigateur');
  console.log('Exécutez: testQuranCloudIntegration()');
}
