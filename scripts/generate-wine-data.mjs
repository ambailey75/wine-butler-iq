import { writeFileSync } from 'fs'
import path from 'path'

const wines = []

function add(producer, country, region, subRegion, classification, varietal, names, format = '750mL (Standard)') {
  for (const name of names) {
    wines.push({
      producer,
      wineName: name,
      country,
      region,
      subRegion: subRegion || null,
      classification: classification || null,
      varietal,
      format,
    })
  }
}

// ============================================================
// BORDEAUX — MEDOC 1855 CLASSIFICATION + SAUTERNES/BARSAC
// ============================================================
const FR = 'France'
const BX = 'Bordeaux'
const BB = 'Bordeaux Blend'

// Premiers Crus (First Growths)
add('Château Lafite Rothschild', FR, BX, 'Pauillac', 'Premier Cru Classé', BB, ['Château Lafite Rothschild', 'Carruades de Lafite'])
add('Château Latour', FR, BX, 'Pauillac', 'Premier Cru Classé', BB, ['Château Latour', 'Les Forts de Latour', 'Pauillac de Latour'])
add('Château Mouton Rothschild', FR, BX, 'Pauillac', 'Premier Cru Classé', BB, ['Château Mouton Rothschild', 'Le Petit Mouton de Mouton Rothschild'])
add('Château Margaux', FR, BX, 'Margaux', 'Premier Cru Classé', BB, ['Château Margaux', 'Pavillon Rouge du Château Margaux'])
add('Château Margaux', FR, BX, 'Margaux', 'Premier Cru Classé', 'White Blend', ['Pavillon Blanc du Château Margaux'])
add('Château Haut-Brion', FR, BX, 'Pessac-Léognan', 'Premier Cru Classé', BB, ['Château Haut-Brion', 'Le Clarence de Haut-Brion'])

// Deuxiemes Crus (Second Growths)
add('Château Rauzan-Ségla', FR, BX, 'Margaux', 'Deuxième Cru Classé', BB, ['Château Rauzan-Ségla'])
add('Château Rauzan-Gassies', FR, BX, 'Margaux', 'Deuxième Cru Classé', BB, ['Château Rauzan-Gassies'])
add('Château Léoville Las Cases', FR, BX, 'St-Julien', 'Deuxième Cru Classé', BB, ['Château Léoville Las Cases'])
add('Château Léoville Poyferré', FR, BX, 'St-Julien', 'Deuxième Cru Classé', BB, ['Château Léoville Poyferré'])
add('Château Léoville Barton', FR, BX, 'St-Julien', 'Deuxième Cru Classé', BB, ['Château Léoville Barton'])
add('Château Durfort-Vivens', FR, BX, 'Margaux', 'Deuxième Cru Classé', BB, ['Château Durfort-Vivens'])
add('Château Gruaud Larose', FR, BX, 'St-Julien', 'Deuxième Cru Classé', BB, ['Château Gruaud Larose'])
add('Château Lascombes', FR, BX, 'Margaux', 'Deuxième Cru Classé', BB, ['Château Lascombes'])
add('Château Brane-Cantenac', FR, BX, 'Margaux', 'Deuxième Cru Classé', BB, ['Château Brane-Cantenac'])
add('Château Pichon Baron', FR, BX, 'Pauillac', 'Deuxième Cru Classé', BB, ['Château Pichon Baron'])
add('Château Pichon Lalande', FR, BX, 'Pauillac', 'Deuxième Cru Classé', BB, ['Château Pichon Longueville Comtesse de Lalande'])
add('Château Ducru-Beaucaillou', FR, BX, 'St-Julien', 'Deuxième Cru Classé', BB, ['Château Ducru-Beaucaillou'])
add('Château Cos d\'Estournel', FR, BX, 'St-Estèphe', 'Deuxième Cru Classé', BB, ['Château Cos d\'Estournel'])
add('Château Montrose', FR, BX, 'St-Estèphe', 'Deuxième Cru Classé', BB, ['Château Montrose'])

// Troisiemes Crus (Third Growths)
add('Château Giscours', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Giscours'])
add('Château Kirwan', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Kirwan'])
add('Château d\'Issan', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château d\'Issan'])
add('Château Lagrange', FR, BX, 'St-Julien', 'Troisième Cru Classé', BB, ['Château Lagrange'])
add('Château Langoa Barton', FR, BX, 'St-Julien', 'Troisième Cru Classé', BB, ['Château Langoa Barton'])
add('Château Malescot St. Exupéry', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Malescot St. Exupéry'])
add('Château Cantenac Brown', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Cantenac Brown'])
add('Château Palmer', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Palmer', 'Alter Ego de Palmer'])
add('Château La Lagune', FR, BX, 'Haut-Médoc', 'Troisième Cru Classé', BB, ['Château La Lagune'])
add('Château Desmirail', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Desmirail'])
add('Château Calon-Ségur', FR, BX, 'St-Estèphe', 'Troisième Cru Classé', BB, ['Château Calon-Ségur'])
add('Château Ferrière', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Ferrière'])
add('Château Marquis d\'Alesme Becker', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Marquis d\'Alesme Becker'])
add('Château Boyd-Cantenac', FR, BX, 'Margaux', 'Troisième Cru Classé', BB, ['Château Boyd-Cantenac'])

// Quatriemes Crus (Fourth Growths)
add('Château Saint-Pierre', FR, BX, 'St-Julien', 'Quatrième Cru Classé', BB, ['Château Saint-Pierre'])
add('Château Talbot', FR, BX, 'St-Julien', 'Quatrième Cru Classé', BB, ['Château Talbot'])
add('Château Branaire-Ducru', FR, BX, 'St-Julien', 'Quatrième Cru Classé', BB, ['Château Branaire-Ducru'])
add('Château Duhart-Milon', FR, BX, 'Pauillac', 'Quatrième Cru Classé', BB, ['Château Duhart-Milon'])
add('Château Pouget', FR, BX, 'Margaux', 'Quatrième Cru Classé', BB, ['Château Pouget'])
add('Château La Tour Carnet', FR, BX, 'Haut-Médoc', 'Quatrième Cru Classé', BB, ['Château La Tour Carnet'])
add('Château Lafon-Rochet', FR, BX, 'St-Estèphe', 'Quatrième Cru Classé', BB, ['Château Lafon-Rochet'])
add('Château Beychevelle', FR, BX, 'St-Julien', 'Quatrième Cru Classé', BB, ['Château Beychevelle'])
add('Château Prieuré-Lichine', FR, BX, 'Margaux', 'Quatrième Cru Classé', BB, ['Château Prieuré-Lichine'])
add('Château Marquis de Terme', FR, BX, 'Margaux', 'Quatrième Cru Classé', BB, ['Château Marquis de Terme'])

// Cinquiemes Crus (Fifth Growths)
add('Château Pontet-Canet', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Pontet-Canet'])
add('Château Batailley', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Batailley'])
add('Château Haut-Batailley', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Haut-Batailley'])
add('Château Grand-Puy-Lacoste', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Grand-Puy-Lacoste'])
add('Château Grand-Puy Ducasse', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Grand-Puy Ducasse'])
add('Château Lynch-Bages', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Lynch-Bages'])
add('Château Lynch-Moussas', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Lynch-Moussas'])
add('Château Dauzac', FR, BX, 'Margaux', 'Cinquième Cru Classé', BB, ['Château Dauzac'])
add('Château d\'Armailhac', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château d\'Armailhac'])
add('Château du Tertre', FR, BX, 'Margaux', 'Cinquième Cru Classé', BB, ['Château du Tertre'])
add('Château Haut-Bages Libéral', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Haut-Bages Libéral'])
add('Château Pédesclaux', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Pédesclaux'])
add('Château Belgrave', FR, BX, 'Haut-Médoc', 'Cinquième Cru Classé', BB, ['Château Belgrave'])
add('Château de Camensac', FR, BX, 'Haut-Médoc', 'Cinquième Cru Classé', BB, ['Château de Camensac'])
add('Château Cos Labory', FR, BX, 'St-Estèphe', 'Cinquième Cru Classé', BB, ['Château Cos Labory'])
add('Château Clerc Milon', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Clerc Milon'])
add('Château Croizet-Bages', FR, BX, 'Pauillac', 'Cinquième Cru Classé', BB, ['Château Croizet-Bages'])
add('Château Cantemerle', FR, BX, 'Haut-Médoc', 'Cinquième Cru Classé', BB, ['Château Cantemerle'])

// Sauternes / Barsac
add('Château d\'Yquem', FR, BX, 'Sauternes', 'Premier Cru Supérieur', 'White Blend', ['Château d\'Yquem'])
add('Château Climens', FR, BX, 'Barsac', 'Premier Cru Classé', 'White Blend', ['Château Climens'])
add('Château Coutet', FR, BX, 'Barsac', 'Premier Cru Classé', 'White Blend', ['Château Coutet'])
add('Château Rieussec', FR, BX, 'Sauternes', 'Premier Cru Classé', 'White Blend', ['Château Rieussec'])
add('Château Suduiraut', FR, BX, 'Sauternes', 'Premier Cru Classé', 'White Blend', ['Château Suduiraut'])
add('Château La Tour Blanche', FR, BX, 'Sauternes', 'Premier Cru Classé', 'White Blend', ['Château La Tour Blanche'])
add('Château Guiraud', FR, BX, 'Sauternes', 'Premier Cru Classé', 'White Blend', ['Château Guiraud'])
add('Château de Fargues', FR, BX, 'Sauternes', null, 'White Blend', ['Château de Fargues'])
add('Château Doisy-Daëne', FR, BX, 'Barsac', 'Deuxième Cru Classé', 'White Blend', ['Château Doisy-Daëne'])
add('Château Doisy-Védrines', FR, BX, 'Barsac', 'Deuxième Cru Classé', 'White Blend', ['Château Doisy-Védrines'])

// ============================================================
// POMEROL (unclassified but premium)
// ============================================================
add('Pétrus', FR, BX, 'Pomerol', null, 'Merlot', ['Pétrus'])
add('Le Pin', FR, BX, 'Pomerol', null, 'Merlot', ['Le Pin'])
add('Château Lafleur', FR, BX, 'Pomerol', null, 'Merlot', ['Château Lafleur'])
add('Vieux Château Certan', FR, BX, 'Pomerol', null, BB, ['Vieux Château Certan'])
add('Château L\'Évangile', FR, BX, 'Pomerol', null, 'Merlot', ['Château L\'Évangile'])
add('Château Trotanoy', FR, BX, 'Pomerol', null, 'Merlot', ['Château Trotanoy'])
add('Château La Conseillante', FR, BX, 'Pomerol', null, 'Merlot', ['Château La Conseillante'])
add('Château Clinet', FR, BX, 'Pomerol', null, 'Merlot', ['Château Clinet'])
add('Château Gazin', FR, BX, 'Pomerol', null, 'Merlot', ['Château Gazin'])
add('Château Certan de May', FR, BX, 'Pomerol', null, BB, ['Château Certan de May'])
add('Château Le Bon Pasteur', FR, BX, 'Pomerol', null, 'Merlot', ['Château Le Bon Pasteur'])
add('Château Beauregard', FR, BX, 'Pomerol', null, 'Merlot', ['Château Beauregard'])
add('Château Nenin', FR, BX, 'Pomerol', null, 'Merlot', ['Château Nenin'])
add('Clos l\'Église', FR, BX, 'Pomerol', null, 'Merlot', ['Clos l\'Église'])
add('Château La Fleur-Pétrus', FR, BX, 'Pomerol', null, 'Merlot', ['Château La Fleur-Pétrus'])
add('Château Hosanna', FR, BX, 'Pomerol', null, 'Merlot', ['Château Hosanna'])
add('Château Gombaude-Guillot', FR, BX, 'Pomerol', null, 'Merlot', ['Château Gombaude-Guillot'])
add('La Violette', FR, BX, 'Pomerol', null, 'Merlot', ['La Violette'])
add('Château Rouget', FR, BX, 'Pomerol', null, 'Merlot', ['Château Rouget'])
add('Château La Croix de Gay', FR, BX, 'Pomerol', null, 'Merlot', ['Château La Croix de Gay'])

// ============================================================
// ST-EMILION
// ============================================================
add('Château Cheval Blanc', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé A', BB, ['Château Cheval Blanc'])
add('Château Ausone', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé A', BB, ['Château Ausone'])
add('Château Pavie', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé A', BB, ['Château Pavie'])
add('Château Angélus', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé A', BB, ['Château Angélus'])
add('Château Figeac', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Figeac'])
add('Château Canon', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Canon'])
add('Château Beau-Séjour Bécot', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Beau-Séjour Bécot'])
add('Château Beauséjour Duffau-Lagarrosse', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Beauséjour Duffau-Lagarrosse'])
add('Château Belair-Monange', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Belair-Monange'])
add('Château Canon-La-Gaffelière', FR, BX, 'St-Émilion', 'Grand Cru Classé', BB, ['Château Canon-La-Gaffelière'])
add('Château Clos Fourtet', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Clos Fourtet'])
add('Château La Gaffelière', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château La Gaffelière'])
add('Château Larcis Ducasse', FR, BX, 'St-Émilion', 'Grand Cru Classé', BB, ['Château Larcis Ducasse'])
add('Château Pavie Macquin', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Pavie Macquin'])
add('Château Troplong Mondot', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Troplong Mondot'])
add('Château Trottevieille', FR, BX, 'St-Émilion', 'Premier Grand Cru Classé B', BB, ['Château Trottevieille'])
add('Château Valandraud', FR, BX, 'St-Émilion', 'Grand Cru Classé', BB, ['Château Valandraud'])
add('Château Tertre Roteboeuf', FR, BX, 'St-Émilion', null, 'Merlot', ['Château Tertre Roteboeuf'])
add('Château La Mondotte', FR, BX, 'St-Émilion', 'Grand Cru Classé', 'Merlot', ['Château La Mondotte'])
add('Château Quinault l\'Enclos', FR, BX, 'St-Émilion', null, 'Merlot', ['Château Quinault l\'Enclos'])
add('Château Fonplégade', FR, BX, 'St-Émilion', 'Grand Cru Classé', 'Merlot', ['Château Fonplégade'])
add('Château Grand Mayne', FR, BX, 'St-Émilion', 'Grand Cru Classé', 'Merlot', ['Château Grand Mayne'])
add('Château Larmande', FR, BX, 'St-Émilion', 'Grand Cru Classé', 'Merlot', ['Château Larmande'])
add('Château Soutard', FR, BX, 'St-Émilion', 'Grand Cru Classé', 'Merlot', ['Château Soutard'])

// ============================================================
// PESSAC-LEOGNAN / GRAVES (besides Haut-Brion)
// ============================================================
add('Château La Mission Haut-Brion', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château La Mission Haut-Brion'])
add('Château Pape Clément', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château Pape Clément'])
add('Château Smith Haut Lafitte', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château Smith Haut Lafitte Rouge'])
add('Château Smith Haut Lafitte', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', 'White Blend', ['Château Smith Haut Lafitte Blanc'])
add('Domaine de Chevalier', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Domaine de Chevalier Rouge'])
add('Domaine de Chevalier', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', 'White Blend', ['Domaine de Chevalier Blanc'])
add('Château Haut-Bailly', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château Haut-Bailly'])
add('Château Carbonnieux', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château Carbonnieux Rouge'])
add('Château Carbonnieux', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', 'White Blend', ['Château Carbonnieux Blanc'])
add('Château Malartic-Lagravière', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château Malartic-Lagravière'])
add('Château de Fieuzal', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château de Fieuzal'])
add('Château Bouscaut', FR, BX, 'Pessac-Léognan', 'Cru Classé de Graves', BB, ['Château Bouscaut'])

// ============================================================
// MEDOC CRU BOURGEOIS & OTHER NOTABLE BORDEAUX
// ============================================================
add('Château Sociando-Mallet', FR, BX, 'Haut-Médoc', 'Cru Bourgeois', BB, ['Château Sociando-Mallet'])
add('Château Phélan Ségur', FR, BX, 'St-Estèphe', 'Cru Bourgeois', BB, ['Château Phélan Ségur'])
add('Château Les Ormes de Pez', FR, BX, 'St-Estèphe', 'Cru Bourgeois', BB, ['Château Les Ormes de Pez'])
add('Château de Pez', FR, BX, 'St-Estèphe', 'Cru Bourgeois', BB, ['Château de Pez'])
add('Château Potensac', FR, BX, 'Médoc', 'Cru Bourgeois', BB, ['Château Potensac'])
add('Château Chasse-Spleen', FR, BX, 'Moulis', 'Cru Bourgeois', BB, ['Château Chasse-Spleen'])
add('Château Poujeaux', FR, BX, 'Moulis', 'Cru Bourgeois', BB, ['Château Poujeaux'])
add('Château Greysac', FR, BX, 'Médoc', 'Cru Bourgeois', BB, ['Château Greysac'])
add('Château Lilian Ladouys', FR, BX, 'St-Estèphe', 'Cru Bourgeois', BB, ['Château Lilian Ladouys'])
add('Château Meyney', FR, BX, 'St-Estèphe', 'Cru Bourgeois', BB, ['Château Meyney'])
add('Château Gloria', FR, BX, 'St-Julien', null, BB, ['Château Gloria'])
add('Château Siran', FR, BX, 'Margaux', 'Cru Bourgeois', BB, ['Château Siran'])
add('Château Labégorce', FR, BX, 'Margaux', 'Cru Bourgeois', BB, ['Château Labégorce'])
add('Château d\'Angludet', FR, BX, 'Margaux', 'Cru Bourgeois', BB, ['Château d\'Angludet'])
add('Château La Tour de By', FR, BX, 'Médoc', 'Cru Bourgeois', BB, ['Château La Tour de By'])

// ============================================================
// BURGUNDY — GRAND CRU & PREMIER CRU
// ============================================================
const BUR = 'Burgundy'
const PN = 'Pinot Noir'
const CH = 'Chardonnay'
const CDN = 'Côte de Nuits'
const CDB = 'Côte de Beaune'

add('Domaine de la Romanée-Conti', FR, BUR, CDN, 'Grand Cru', PN, ['Romanée-Conti', 'La Tâche', 'Richebourg', 'Romanée-St-Vivant', 'Grands-Échezeaux', 'Échezeaux'])
add('Domaine Leroy', FR, BUR, CDN, 'Grand Cru', PN, ['Romanée-St-Vivant', 'Richebourg', 'Chambertin'])
add('Domaine Armand Rousseau', FR, BUR, CDN, 'Grand Cru', PN, ['Chambertin', 'Chambertin-Clos de Bèze', 'Clos de la Roche', 'Charmes-Chambertin'])
add('Domaine Leflaive', FR, BUR, CDB, 'Grand Cru', CH, ['Bâtard-Montrachet', 'Chevalier-Montrachet', 'Montrachet'])
add('Domaine Comte Georges de Vogüé', FR, BUR, CDN, 'Grand Cru', PN, ['Musigny', 'Bonnes-Mares'])
add('Domaine Comte Georges de Vogüé', FR, BUR, CDN, 'Premier Cru', PN, ['Chambolle-Musigny Les Amoureuses'])
add('Domaine Dujac', FR, BUR, CDN, 'Grand Cru', PN, ['Clos de la Roche', 'Clos Saint-Denis', 'Bonnes-Mares'])
add('Domaine Ponsot', FR, BUR, CDN, 'Grand Cru', PN, ['Clos de la Roche', 'Griotte-Chambertin'])
add('Domaine Méo-Camuzet', FR, BUR, CDN, 'Grand Cru', PN, ['Richebourg', 'Clos de Vougeot', 'Corton'])
add('Domaine du Comte Liger-Belair', FR, BUR, CDN, 'Grand Cru', PN, ['La Romanée'])
add('Domaine du Comte Liger-Belair', FR, BUR, CDN, 'Premier Cru', PN, ['Vosne-Romanée Aux Reignots'])
add('Domaine Bonneau du Martray', FR, BUR, CDB, 'Grand Cru', CH, ['Corton-Charlemagne'])
add('Domaine Bonneau du Martray', FR, BUR, CDB, 'Grand Cru', PN, ['Corton'])
add('Domaine Coche-Dury', FR, BUR, CDB, 'Grand Cru', CH, ['Corton-Charlemagne'])
add('Domaine Coche-Dury', FR, BUR, CDB, 'Premier Cru', CH, ['Meursault Les Perrières'])
add('Domaine Georges Roumier', FR, BUR, CDN, 'Grand Cru', PN, ['Bonnes-Mares', 'Musigny', 'Ruchottes-Chambertin'])
add('Domaine Faiveley', FR, BUR, CDN, 'Grand Cru', PN, ['Chambertin-Clos de Bèze', 'Mazis-Chambertin', 'Corton Clos des Cortons'])
add('Domaine Jean Grivot', FR, BUR, CDN, 'Grand Cru', PN, ['Richebourg', 'Clos de Vougeot'])
add('Domaine Anne Gros', FR, BUR, CDN, 'Grand Cru', PN, ['Richebourg', 'Clos de Vougeot'])
add('Maison Joseph Drouhin', FR, BUR, CDB, 'Grand Cru', CH, ['Montrachet'])
add('Maison Joseph Drouhin', FR, BUR, CDN, 'Grand Cru', PN, ['Grands-Échezeaux', 'Musigny'])
add('Maison Bouchard Père et Fils', FR, BUR, CDB, 'Grand Cru', CH, ['Le Montrachet'])
add('Maison Bouchard Père et Fils', FR, BUR, CDB, 'Grand Cru', CH, ['Chevalier-Montrachet La Cabotte'])
add('Domaine Ramonet', FR, BUR, CDB, 'Grand Cru', CH, ['Montrachet', 'Bâtard-Montrachet'])
add('Domaine Ramonet', FR, BUR, CDB, 'Premier Cru', CH, ['Chassagne-Montrachet Les Ruchottes'])
add('Domaine d\'Auvenay', FR, BUR, CDN, 'Grand Cru', PN, ['Bonnes-Mares', 'Mazis-Chambertin'])
add('Château de la Tour', FR, BUR, CDN, 'Grand Cru', PN, ['Clos de Vougeot'])
add('Domaine Mugneret-Gibourg', FR, BUR, CDN, 'Grand Cru', PN, ['Clos de Vougeot', 'Échezeaux', 'Ruchottes-Chambertin'])
add('Domaine Sylvain Cathiard', FR, BUR, CDN, 'Grand Cru', PN, ['Romanée-St-Vivant'])
add('Domaine Sylvain Cathiard', FR, BUR, CDN, 'Premier Cru', PN, ['Vosne-Romanée Aux Malconsorts'])
add('Domaine Robert Groffier', FR, BUR, CDN, 'Grand Cru', PN, ['Chambertin-Clos de Bèze', 'Bonnes-Mares'])
add('Domaine Hubert Lignier', FR, BUR, CDN, 'Grand Cru', PN, ['Clos de la Roche', 'Charmes-Chambertin'])
add('Domaine Perrot-Minot', FR, BUR, CDN, 'Grand Cru', PN, ['Charmes-Chambertin', 'Mazoyères-Chambertin'])

// Chablis & Burgundy Premier Cru / Village
add('Domaine William Fèvre', FR, BUR, 'Chablis', 'Grand Cru', CH, ['Chablis Grand Cru Les Clos', 'Chablis Grand Cru Bougros'])
add('Domaine William Fèvre', FR, BUR, 'Chablis', 'Premier Cru', CH, ['Chablis Premier Cru Vaillons'])
add('Domaine Raveneau', FR, BUR, 'Chablis', 'Grand Cru', CH, ['Chablis Grand Cru Valmur'])
add('Domaine Raveneau', FR, BUR, 'Chablis', 'Premier Cru', CH, ['Chablis Premier Cru Montée de Tonnerre'])
add('Maison Louis Jadot', FR, BUR, CDB, 'Premier Cru', PN, ['Beaune Premier Cru Clos des Ursules'])
add('Maison Louis Jadot', FR, BUR, CDN, 'Premier Cru', PN, ['Gevrey-Chambertin Clos Saint-Jacques'])
add('Maison Louis Jadot', FR, BUR, CDB, 'Grand Cru', CH, ['Corton-Charlemagne'])
add('Domaine Marquis d\'Angerville', FR, BUR, CDB, 'Premier Cru', PN, ['Volnay Premier Cru Champans', 'Volnay Premier Cru Clos des Ducs'])
add('Domaine de Montille', FR, BUR, CDB, 'Premier Cru', PN, ['Pommard Les Rugiens', 'Volnay Taillepieds'])
add('Domaine Michel Lafarge', FR, BUR, CDB, 'Premier Cru', PN, ['Volnay Clos du Château des Ducs'])
add('Domaine Leflaive', FR, BUR, CDB, 'Premier Cru', CH, ['Puligny-Montrachet Premier Cru Les Pucelles', 'Puligny-Montrachet Premier Cru Clavoillon'])
add('Domaine Etienne Sauzet', FR, BUR, CDB, 'Premier Cru', CH, ['Puligny-Montrachet Premier Cru Les Combettes'])
add('Domaine Paul Pernot', FR, BUR, CDB, 'Premier Cru', CH, ['Puligny-Montrachet Premier Cru Les Folatières'])
add('Domaine Jean-Marc Boillot', FR, BUR, CDB, 'Premier Cru', PN, ['Pommard Les Rugiens'])
add('Maison Louis Latour', FR, BUR, CDB, 'Grand Cru', CH, ['Corton-Charlemagne'])
add('Domaine Comte Senard', FR, BUR, CDB, 'Grand Cru', PN, ['Corton Clos des Meix'])
add('Domaine Tollot-Beaut', FR, BUR, CDB, 'Grand Cru', PN, ['Corton Bressandes'])
add('Domaine Rapet Père et Fils', FR, BUR, CDB, 'Premier Cru', PN, ['Pernand-Vergelesses Premier Cru Île des Vergelesses'])
add('Domaine Roulot', FR, BUR, CDB, 'Premier Cru', CH, ['Meursault Premier Cru Charmes'])
add('Domaine Arnaud Ente', FR, BUR, CDB, null, CH, ['Meursault Clos des Ambres'])
add('Domaine Pierre-Yves Colin-Morey', FR, BUR, CDB, 'Premier Cru', CH, ['Chassagne-Montrachet Premier Cru En Remilly'])
add('Domaine Marc Colin et Fils', FR, BUR, CDB, 'Premier Cru', CH, ['Saint-Aubin Premier Cru En Remilly'])

// ============================================================
// NAPA VALLEY CABERNET
// ============================================================
const US = 'United States'
const NAPA = 'Napa Valley'
const CS = 'Cabernet Sauvignon'

add('Screaming Eagle', US, NAPA, 'Oakville', null, CS, ['Screaming Eagle Cabernet Sauvignon'])
add('Harlan Estate', US, NAPA, 'Oakville', null, CS, ['Harlan Estate', 'The Maiden'])
add('Opus One', US, NAPA, 'Oakville', null, BB, ['Opus One'])
add('Dominus Estate', US, NAPA, 'Yountville', null, BB, ['Dominus', 'Napanook'])
add('Caymus Vineyards', US, NAPA, 'Rutherford', null, CS, ['Caymus Special Selection Cabernet Sauvignon', 'Caymus Napa Valley Cabernet Sauvignon'])
add('Shafer Vineyards', US, NAPA, 'Stags Leap District', null, CS, ['Shafer Hillside Select Cabernet Sauvignon', 'Shafer One Point Five Cabernet Sauvignon'])
add('Ridge Vineyards', US, 'Santa Cruz Mountains', null, null, BB, ['Ridge Monte Bello'])
add('Heitz Cellar', US, NAPA, 'St. Helena', null, CS, ['Heitz Martha\'s Vineyard Cabernet Sauvignon'])
add('Stag\'s Leap Wine Cellars', US, NAPA, 'Stags Leap District', null, CS, ['Stag\'s Leap Wine Cellars Cask 23', 'Stag\'s Leap Wine Cellars Fay Vineyard Cabernet Sauvignon', 'Stag\'s Leap Wine Cellars SLV Cabernet Sauvignon'])
add('Robert Mondavi Winery', US, NAPA, 'Oakville', null, CS, ['Robert Mondavi Reserve Cabernet Sauvignon'])
add('Joseph Phelps Vineyards', US, NAPA, 'St. Helena', null, BB, ['Insignia'])
add('Spottswoode Estate', US, NAPA, 'St. Helena', null, CS, ['Spottswoode Estate Cabernet Sauvignon'])
add('Diamond Creek Vineyards', US, NAPA, 'Diamond Mountain District', null, CS, ['Diamond Creek Volcanic Hill Cabernet Sauvignon', 'Diamond Creek Red Rock Terrace Cabernet Sauvignon'])
add('Mayacamas Vineyards', US, NAPA, 'Mount Veeder', null, CS, ['Mayacamas Cabernet Sauvignon'])
add('Dunn Vineyards', US, NAPA, 'Howell Mountain', null, CS, ['Dunn Howell Mountain Cabernet Sauvignon'])
add('Chateau Montelena', US, NAPA, 'Calistoga', null, CS, ['Chateau Montelena Cabernet Sauvignon'])
add('Far Niente', US, NAPA, 'Oakville', null, CS, ['Far Niente Cabernet Sauvignon'])
add('Silver Oak', US, NAPA, 'Oakville', null, CS, ['Silver Oak Napa Valley Cabernet Sauvignon'])
add('Silver Oak', US, 'Alexander Valley', null, null, CS, ['Silver Oak Alexander Valley Cabernet Sauvignon'])
add('Beringer Vineyards', US, NAPA, 'St. Helena', null, CS, ['Beringer Private Reserve Cabernet Sauvignon'])
add('Cakebread Cellars', US, NAPA, 'Rutherford', null, CS, ['Cakebread Cellars Cabernet Sauvignon'])
add('Duckhorn Vineyards', US, NAPA, 'St. Helena', null, 'Merlot', ['Duckhorn Three Palms Vineyard Merlot'])
add('Frog\'s Leap', US, NAPA, 'Rutherford', null, CS, ['Frog\'s Leap Cabernet Sauvignon'])
add('Trefethen Family Vineyards', US, NAPA, 'Oak Knoll District', null, CS, ['Trefethen Cabernet Sauvignon'])
add('Grgich Hills Estate', US, NAPA, 'Rutherford', null, CS, ['Grgich Hills Estate Cabernet Sauvignon'])
add('Chimney Rock Winery', US, NAPA, 'Stags Leap District', null, BB, ['Chimney Rock Elevage'])
add('Quintessa', US, NAPA, 'Rutherford', null, BB, ['Quintessa'])
add('Vineyard 29', US, NAPA, 'St. Helena', null, CS, ['Vineyard 29 Cabernet Sauvignon'])
add('Hundred Acre', US, NAPA, 'Oakville', null, CS, ['Hundred Acre Ark Vineyard Cabernet Sauvignon'])
add('Bryant Family Vineyard', US, NAPA, 'Pritchard Hill', null, CS, ['Bryant Family Vineyard Cabernet Sauvignon'])
add('Colgin Cellars', US, NAPA, 'Pritchard Hill', null, CS, ['Colgin IX Estate Cabernet Sauvignon'])
add('Colgin Cellars', US, NAPA, 'Pritchard Hill', null, BB, ['Colgin Cariad'])
add('Araujo Estate / Eisele Vineyard', US, NAPA, 'Calistoga', null, CS, ['Eisele Vineyard Cabernet Sauvignon'])
add('Abreu Vineyards', US, NAPA, 'St. Helena', null, CS, ['Abreu Madrona Ranch Cabernet Sauvignon'])
add('Scarecrow', US, NAPA, 'Rutherford', null, CS, ['Scarecrow Cabernet Sauvignon'])
add('Continuum Estate', US, NAPA, 'Pritchard Hill', null, BB, ['Continuum'])
add('Schrader Cellars', US, NAPA, 'Oakville', null, CS, ['Schrader Old Sparky Cabernet Sauvignon'])
add('Realm Cellars', US, NAPA, null, null, CS, ['Realm The Bard'])
add('Promontory', US, NAPA, null, null, BB, ['Promontory'])
add('Sloan Estate', US, NAPA, 'Rutherford', null, BB, ['Sloan Estate Proprietary Red'])
add('Vineyard 7 & 8', US, NAPA, 'Spring Mountain District', null, CS, ['Vineyard 7 & 8 Cabernet Sauvignon'])
add('Cardinale', US, NAPA, null, null, CS, ['Cardinale'])
add('Lokoya', US, NAPA, 'Mount Veeder', null, CS, ['Lokoya Mount Veeder Cabernet Sauvignon'])
add('Paul Hobbs', US, NAPA, 'Oakville', null, CS, ['Paul Hobbs Beckstoffer To Kalon Cabernet Sauvignon'])
add('Corison Winery', US, NAPA, 'St. Helena', null, CS, ['Corison Kronos Vineyard Cabernet Sauvignon'])
add('Staglin Family Vineyard', US, NAPA, 'Rutherford', null, CS, ['Staglin Family Vineyard Cabernet Sauvignon'])
add('Vine Hill Ranch', US, NAPA, 'Oakville', null, CS, ['Vine Hill Ranch Cabernet Sauvignon'])
add('Lewis Cellars', US, NAPA, null, null, CS, ['Lewis Cellars Reserve Cabernet Sauvignon'])
add('Hourglass', US, NAPA, 'Calistoga', null, CS, ['Hourglass Blueline Estate Cabernet Sauvignon'])
add('Larkmead Vineyards', US, NAPA, 'Calistoga', null, CS, ['Larkmead Solari Cabernet Sauvignon'])
add('Beaulieu Vineyard', US, NAPA, 'Rutherford', null, CS, ['Beaulieu Vineyard Georges de Latour Private Reserve'])
add('Mount Veeder Winery', US, NAPA, 'Mount Veeder', null, CS, ['Mount Veeder Winery Reserve Cabernet Sauvignon'])
add('Sequoia Grove', US, NAPA, 'Rutherford', null, CS, ['Sequoia Grove Cambium Cabernet Sauvignon'])
add('PlumpJack', US, NAPA, 'Oakville', null, CS, ['PlumpJack Estate Cabernet Sauvignon'])

// ============================================================
// SONOMA — PINOT NOIR & CHARDONNAY
// ============================================================
const SONOMA = 'Sonoma County'
const RRV = 'Russian River Valley'

add('Williams Selyem', US, SONOMA, RRV, null, PN, ['Williams Selyem Russian River Valley Pinot Noir', 'Williams Selyem Westside Road Neighbors Pinot Noir'])
add('Kistler Vineyards', US, SONOMA, RRV, null, CH, ['Kistler Vineyards Chardonnay'])
add('Marcassin', US, SONOMA, 'Sonoma Coast', null, CH, ['Marcassin Vineyard Chardonnay'])
add('Aubert Wines', US, NAPA, null, null, CH, ['Aubert UV-SL Vineyard Chardonnay'])
add('Kosta Browne', US, SONOMA, RRV, null, PN, ['Kosta Browne Russian River Valley Pinot Noir'])
add('Dehlinger Winery', US, SONOMA, RRV, null, PN, ['Dehlinger Russian River Valley Pinot Noir'])
add('Hartford Court', US, SONOMA, RRV, null, PN, ['Hartford Court Sevens Bench Pinot Noir'])
add('Flowers Vineyard & Winery', US, SONOMA, 'Sonoma Coast', null, PN, ['Flowers Sonoma Coast Pinot Noir'])
add('Littorai', US, SONOMA, 'Sonoma Coast', null, PN, ['Littorai Sonoma Coast Pinot Noir'])
add('Failla Wines', US, SONOMA, 'Sonoma Coast', null, PN, ['Failla Sonoma Coast Pinot Noir'])
add('Peay Vineyards', US, SONOMA, 'Sonoma Coast', null, PN, ['Peay Sonoma Coast Pinot Noir'])
add('Ramey Wine Cellars', US, SONOMA, RRV, null, CH, ['Ramey Russian River Valley Chardonnay'])
add('Sonoma-Cutrer', US, SONOMA, RRV, null, CH, ['Sonoma-Cutrer Russian River Ranches Chardonnay'])
add('Gary Farrell Winery', US, SONOMA, RRV, null, PN, ['Gary Farrell Russian River Valley Pinot Noir'])
add('Merry Edwards Winery', US, SONOMA, RRV, null, PN, ['Merry Edwards Russian River Valley Pinot Noir'])
add('Rochioli Vineyards', US, SONOMA, RRV, null, PN, ['Rochioli Estate Pinot Noir'])
add('Joseph Swan Vineyards', US, SONOMA, RRV, null, PN, ['Joseph Swan Russian River Valley Pinot Noir'])

// ============================================================
// TUSCANY — BRUNELLO & SUPER TUSCANS
// ============================================================
const IT = 'Italy'
const TUS = 'Tuscany'
const SANG = 'Sangiovese'

add('Biondi-Santi', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Biondi-Santi Brunello di Montalcino'])
add('Casanova di Neri', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Casanova di Neri Brunello di Montalcino Tenuta Nuova'])
add('Case Basse di Gianfranco Soldera', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Case Basse Brunello di Montalcino'])
add('Poggio di Sotto', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Poggio di Sotto Brunello di Montalcino'])
add('Salvioni', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Salvioni Brunello di Montalcino'])
add('Il Marroneto', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Il Marroneto Brunello di Montalcino Madonna delle Grazie'])
add('Gianni Brunelli', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Gianni Brunelli Brunello di Montalcino'])
add('Conti Costanti', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Conti Costanti Brunello di Montalcino'])
add('Pertimali (Livio Sassetti)', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Pertimali Brunello di Montalcino'])
add('Valdicava', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Valdicava Brunello di Montalcino Madonna del Piano'])
add('Ciacci Piccolomini d\'Aragona', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Ciacci Piccolomini d\'Aragona Brunello di Montalcino'])
add('Castello Banfi', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Banfi Brunello di Montalcino Poggio alle Mura'])
add('Altesino', IT, TUS, 'Montalcino', 'DOCG', SANG, ['Altesino Brunello di Montalcino Montosoli'])

add('Tenuta San Guido', IT, TUS, 'Bolgheri', 'IGT Toscana', CS, ['Sassicaia'])
add('Tenuta dell\'Ornellaia', IT, TUS, 'Bolgheri', 'IGT Toscana', BB, ['Ornellaia'])
add('Tenuta dell\'Ornellaia', IT, TUS, 'Bolgheri', 'IGT Toscana', 'Merlot', ['Masseto'])
add('Marchesi Antinori', IT, TUS, 'Chianti Classico', 'IGT Toscana', SANG, ['Tignanello'])
add('Marchesi Antinori', IT, TUS, 'Chianti Classico', 'IGT Toscana', CS, ['Solaia'])
add('Tenuta di Trinoro', IT, TUS, 'Val d\'Orcia', 'IGT Toscana', 'Red Blend', ['Tenuta di Trinoro'])
add('Le Macchiole', IT, TUS, 'Bolgheri', 'IGT Toscana', 'Merlot', ['Le Macchiole Messorio'])
add('Le Macchiole', IT, TUS, 'Bolgheri', 'IGT Toscana', 'Red Blend', ['Le Macchiole Paleo Rosso'])
add('Castello di Ama', IT, TUS, 'Chianti Classico', 'IGT Toscana', 'Merlot', ['Castello di Ama L\'Apparita'])
add('Fontodi', IT, TUS, 'Chianti Classico', 'IGT Toscana', SANG, ['Fontodi Flaccianello della Pieve'])
add('Isole e Olena', IT, TUS, 'Chianti Classico', 'IGT Toscana', SANG, ['Isole e Olena Cepparello'])
add('Tua Rita', IT, TUS, 'Suvereto', 'IGT Toscana', 'Merlot', ['Tua Rita Redigaffi'])
add('Petrolo', IT, TUS, 'Val d\'Arno di Sopra', 'IGT Toscana', 'Merlot', ['Petrolo Galatrona'])
add('Avignonesi', IT, TUS, 'Montepulciano', 'IGT Toscana', 'Red Blend', ['Avignonesi Desiderio'])
add('Querciabella', IT, TUS, 'Chianti Classico', 'IGT Toscana', 'Red Blend', ['Querciabella Camartina'])
add('San Felice', IT, TUS, 'Chianti Classico', 'IGT Toscana', 'Red Blend', ['San Felice Vigorello'])
add('Castello dei Rampolla', IT, TUS, 'Chianti Classico', 'IGT Toscana', 'Red Blend', ['Castello dei Rampolla Sammarco'])

// ============================================================
// PIEDMONT — BAROLO & BARBARESCO
// ============================================================
const PIE = 'Piedmont'
const NEB = 'Nebbiolo'

add('Giacomo Conterno', IT, PIE, 'Barolo', 'DOCG', NEB, ['Giacomo Conterno Barolo Monfortino Riserva', 'Giacomo Conterno Barolo Cascina Francia'])
add('Bruno Giacosa', IT, PIE, 'Barolo', 'DOCG', NEB, ['Bruno Giacosa Barolo Falletto Riserva'])
add('Bruno Giacosa', IT, PIE, 'Barbaresco', 'DOCG', NEB, ['Bruno Giacosa Barbaresco Asili Riserva'])
add('Giuseppe Rinaldi', IT, PIE, 'Barolo', 'DOCG', NEB, ['Giuseppe Rinaldi Barolo Brunate-Le Coste'])
add('Bartolo Mascarello', IT, PIE, 'Barolo', 'DOCG', NEB, ['Bartolo Mascarello Barolo'])
add('Roberto Voerzio', IT, PIE, 'Barolo', 'DOCG', NEB, ['Roberto Voerzio Barolo Cerequio'])
add('Elio Altare', IT, PIE, 'Barolo', 'DOCG', NEB, ['Elio Altare Barolo Vigneto Arborina'])
add('Luciano Sandrone', IT, PIE, 'Barolo', 'DOCG', NEB, ['Luciano Sandrone Barolo Cannubi Boschis'])
add('Paolo Scavino', IT, PIE, 'Barolo', 'DOCG', NEB, ['Paolo Scavino Barolo Bric del Fiasc'])
add('Marchesi di Barolo', IT, PIE, 'Barolo', 'DOCG', NEB, ['Marchesi di Barolo Barolo Cannubi'])
add('Cavallotto', IT, PIE, 'Barolo', 'DOCG', NEB, ['Cavallotto Barolo Bricco Boschis Riserva'])
add('Vietti', IT, PIE, 'Barolo', 'DOCG', NEB, ['Vietti Barolo Rocche di Castiglione'])
add('Poderi Aldo Conterno', IT, PIE, 'Barolo', 'DOCG', NEB, ['Aldo Conterno Barolo Bussia'])
add('Gaja', IT, PIE, 'Barbaresco', 'DOCG', NEB, ['Gaja Barbaresco'])
add('Gaja', IT, PIE, 'Barolo', 'DOCG', NEB, ['Gaja Sperss'])
add('Ceretto', IT, PIE, 'Barolo', 'DOCG', NEB, ['Ceretto Barolo Bricco Rocche'])

// ============================================================
// RHONE VALLEY — HERMITAGE, COTE-ROTIE, CHATEAUNEUF-DU-PAPE
// ============================================================
const RHONE = 'Rhône Valley'
const SYR = 'Syrah / Shiraz'
const RB = 'Rhône Blend'

add('M. Chapoutier', FR, RHONE, 'Hermitage', null, SYR, ['Chapoutier Hermitage Le Pavillon', 'Chapoutier Ermitage Le Méal'])
add('Domaine Jean-Louis Chave', FR, RHONE, 'Hermitage', null, SYR, ['Jean-Louis Chave Hermitage'])
add('Paul Jaboulet Aîné', FR, RHONE, 'Hermitage', null, SYR, ['Paul Jaboulet Aîné Hermitage La Chapelle'])
add('E. Guigal', FR, RHONE, 'Côte-Rôtie', null, SYR, ['Guigal Côte-Rôtie La Mouline', 'Guigal Côte-Rôtie La Landonne', 'Guigal Côte-Rôtie La Turque'])
add('E. Guigal', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Guigal Châteauneuf-du-Pape'])
add('René Rostaing', FR, RHONE, 'Côte-Rôtie', null, SYR, ['René Rostaing Côte-Rôtie La Landonne'])
add('Domaine Jamet', FR, RHONE, 'Côte-Rôtie', null, SYR, ['Jamet Côte-Rôtie'])
add('Château de Beaucastel', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Château de Beaucastel Châteauneuf-du-Pape', 'Château de Beaucastel Hommage à Jacques Perrin'])
add('Domaine du Vieux Télégraphe', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Vieux Télégraphe Châteauneuf-du-Pape La Crau'])
add('Château Rayas', FR, RHONE, 'Châteauneuf-du-Pape', null, 'Grenache', ['Château Rayas Châteauneuf-du-Pape'])
add('Clos des Papes', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Clos des Papes Châteauneuf-du-Pape'])
add('Domaine Henri Bonneau', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Henri Bonneau Châteauneuf-du-Pape Réserve des Célestins'])
add('Domaine de la Janasse', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Domaine de la Janasse Châteauneuf-du-Pape Vieilles Vignes'])
add('Domaine du Pegau', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Domaine du Pegau Châteauneuf-du-Pape Cuvée Da Capo'])
add('Tardieu-Laurent', FR, RHONE, 'Côte-Rôtie', null, SYR, ['Tardieu-Laurent Côte-Rôtie'])
add('Domaine Georges Vernay', FR, RHONE, 'Condrieu', null, 'Viognier', ['Georges Vernay Condrieu Coteau de Vernon'])
add('Yves Cuilleron', FR, RHONE, 'Côte-Rôtie', null, SYR, ['Yves Cuilleron Côte-Rôtie Madinière'])
add('Domaine Auguste Clape', FR, RHONE, 'Cornas', null, SYR, ['Auguste Clape Cornas'])
add('Domaine Thierry Allemand', FR, RHONE, 'Cornas', null, SYR, ['Thierry Allemand Cornas Reynard'])
add('Domaine du Vieux Lazaret', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Vieux Lazaret Châteauneuf-du-Pape'])
add('Domaine Santa Duc', FR, RHONE, 'Gigondas', null, RB, ['Santa Duc Gigondas'])
add('Château La Nerthe', FR, RHONE, 'Châteauneuf-du-Pape', null, RB, ['Château La Nerthe Châteauneuf-du-Pape'])

// ============================================================
// CHAMPAGNE
// ============================================================
const CHA = 'Champagne'
const SPK = 'Champagne / Sparkling Blend'

add('Krug', FR, CHA, null, null, SPK, ['Krug Grande Cuvée', 'Krug Vintage Brut', 'Krug Clos du Mesnil'])
add('Dom Pérignon', FR, CHA, null, null, SPK, ['Dom Pérignon Vintage Brut', 'Dom Pérignon Rosé', 'Dom Pérignon P2'])
add('Louis Roederer', FR, CHA, null, null, SPK, ['Cristal', 'Cristal Rosé', 'Louis Roederer Collection 244'])
add('Salon', FR, CHA, 'Côte des Blancs', null, SPK, ['Salon Le Mesnil Blanc de Blancs'])
add('Bollinger', FR, CHA, null, null, SPK, ['Bollinger La Grande Année', 'Bollinger Special Cuvée', 'Bollinger R.D.'])
add('Pol Roger', FR, CHA, null, null, SPK, ['Pol Roger Sir Winston Churchill', 'Pol Roger Brut Réserve'])
add('Taittinger', FR, CHA, null, null, SPK, ['Taittinger Comtes de Champagne Blanc de Blancs', 'Taittinger Brut Réserve'])
add('Veuve Clicquot', FR, CHA, null, null, SPK, ['Veuve Clicquot La Grande Dame', 'Veuve Clicquot Yellow Label Brut'])
add('Moët & Chandon', FR, CHA, null, null, SPK, ['Moët & Chandon Grand Vintage', 'Moët Impérial Brut'])
add('Ruinart', FR, CHA, null, null, SPK, ['Ruinart Dom Ruinart Blanc de Blancs', 'Ruinart Blanc de Blancs'])
add('Philipponnat', FR, CHA, 'Montagne de Reims', null, SPK, ['Philipponnat Clos des Goisses'])
add('Jacques Selosse', FR, CHA, 'Côte des Blancs', null, SPK, ['Jacques Selosse Substance', 'Jacques Selosse Initial'])
add('Pierre Péters', FR, CHA, 'Côte des Blancs', null, SPK, ['Pierre Péters Cuvée Spéciale Les Chetillons'])
add('Egly-Ouriet', FR, CHA, 'Montagne de Reims', null, SPK, ['Egly-Ouriet Grand Cru Brut Tradition'])
add('Henri Giraud', FR, CHA, 'Montagne de Reims', null, SPK, ['Henri Giraud Hommage à François Hémart'])
add('Charles Heidsieck', FR, CHA, null, null, SPK, ['Charles Heidsieck Blanc des Millénaires'])
add('Perrier-Jouët', FR, CHA, null, null, SPK, ['Perrier-Jouët Belle Epoque'])
add('G.H. Mumm', FR, CHA, null, null, SPK, ['G.H. Mumm Cordon Rouge', 'Mumm R. Lalou'])
add('Laurent-Perrier', FR, CHA, null, null, SPK, ['Laurent-Perrier Grand Siècle', 'Laurent-Perrier Cuvée Rosé'])
add('Armand de Brignac', FR, CHA, null, null, SPK, ['Armand de Brignac Ace of Spades Brut Gold'])
add('Delamotte', FR, CHA, 'Côte des Blancs', null, SPK, ['Delamotte Blanc de Blancs'])
add('Billecart-Salmon', FR, CHA, null, null, SPK, ['Billecart-Salmon Cuvée Nicolas François', 'Billecart-Salmon Brut Rosé'])
add('Henriot', FR, CHA, null, null, SPK, ['Henriot Cuvée des Enchanteleurs'])
add('Pierre Gimonnet et Fils', FR, CHA, 'Côte des Blancs', null, SPK, ['Pierre Gimonnet Fleuron Blanc de Blancs'])
add('Agrapart & Fils', FR, CHA, 'Côte des Blancs', null, SPK, ['Agrapart Minéral Blanc de Blancs'])
add('Larmandier-Bernier', FR, CHA, 'Côte des Blancs', null, SPK, ['Larmandier-Bernier Terre de Vertus'])
add('Vilmart & Cie', FR, CHA, 'Montagne de Reims', null, SPK, ['Vilmart Coeur de Cuvée'])
add('Tarlant', FR, CHA, 'Vallée de la Marne', null, SPK, ['Tarlant Cuvée Louis'])

// ============================================================
// BAROSSA VALLEY SHIRAZ (Australia)
// ============================================================
const AU = 'Australia'
const BAROSSA = 'Barossa Valley'

add('Penfolds', AU, BAROSSA, null, null, SYR, ['Penfolds Grange', 'Penfolds RWT Shiraz', 'Penfolds St Henri Shiraz', 'Penfolds Bin 28 Kalimna Shiraz'])
add('Henschke', AU, 'Eden Valley', null, null, SYR, ['Henschke Hill of Grace', 'Henschke Mount Edelstone'])
add('Torbreck Vintners', AU, BAROSSA, null, null, SYR, ['Torbreck The Factor', 'Torbreck RunRig'])
add('Torbreck Vintners', AU, BAROSSA, null, null, RB, ['Torbreck Descendant'])
add('Two Hands Wines', AU, BAROSSA, null, null, SYR, ['Two Hands Ares Shiraz', 'Two Hands Bella\'s Garden Shiraz'])
add('Rockford Wines', AU, BAROSSA, null, null, SYR, ['Rockford Basket Press Shiraz'])
add('Yalumba', AU, BAROSSA, null, null, SYR, ['Yalumba The Octavius Shiraz'])
add('Yalumba', AU, BAROSSA, null, null, 'Red Blend', ['Yalumba The Signature Cabernet Shiraz'])
add('Elderton Wines', AU, BAROSSA, null, null, SYR, ['Elderton Command Shiraz'])
add('Chris Ringland', AU, BAROSSA, null, null, SYR, ['Chris Ringland Shiraz'])
add('Greenock Creek', AU, BAROSSA, null, null, SYR, ['Greenock Creek Roennfeldt Road Shiraz'])
add('Glaetzer Wines', AU, BAROSSA, null, null, SYR, ['Glaetzer Amon-Ra Shiraz'])
add('John Duval Wines', AU, BAROSSA, null, null, SYR, ['John Duval Eligo Shiraz'])
add('Charles Melton Wines', AU, BAROSSA, null, null, RB, ['Charles Melton Nine Popes'])
add('Spinifex', AU, BAROSSA, null, null, SYR, ['Spinifex Bête Noir Shiraz'])
add('The Standish Wine Company', AU, BAROSSA, null, null, SYR, ['Standish The Relic Shiraz'])
add('Turkey Flat', AU, BAROSSA, null, null, SYR, ['Turkey Flat Shiraz'])

// ============================================================
// MOSEL RIESLING (Germany)
// ============================================================
const DE = 'Germany'
const MOSEL = 'Mosel'
const RIES = 'Riesling'

add('Egon Müller - Scharzhof', DE, MOSEL, null, 'Auslese', RIES, ['Egon Müller Scharzhofberger Riesling Auslese', 'Egon Müller Scharzhofberger Riesling Kabinett'])
add('Joh. Jos. Prüm', DE, MOSEL, null, 'Spätlese', RIES, ['J.J. Prüm Wehlener Sonnenuhr Riesling Spätlese'])
add('Joh. Jos. Prüm', DE, MOSEL, null, 'Auslese', RIES, ['J.J. Prüm Graacher Himmelreich Riesling Auslese'])
add('Weingut Fritz Haag', DE, MOSEL, null, 'Spätlese', RIES, ['Fritz Haag Brauneberger Juffer-Sonnenuhr Riesling Spätlese'])
add('Dr. Loosen', DE, MOSEL, null, 'Auslese', RIES, ['Dr. Loosen Erdener Prälat Riesling Auslese'])
add('Dr. Loosen', DE, MOSEL, null, 'Spätlese', RIES, ['Dr. Loosen Ürziger Würzgarten Riesling Spätlese'])
add('Markus Molitor', DE, MOSEL, null, 'Spätlese', RIES, ['Markus Molitor Zeltinger Sonnenuhr Riesling Spätlese'])
add('Weingut Willi Schaefer', DE, MOSEL, null, 'Spätlese', RIES, ['Willi Schaefer Graacher Domprobst Riesling Spätlese'])
add('Selbach-Oster', DE, MOSEL, null, 'Spätlese', RIES, ['Selbach-Oster Zeltinger Sonnenuhr Riesling Spätlese'])
add('Schloss Lieser', DE, MOSEL, null, 'Spätlese', RIES, ['Schloss Lieser Niederberg Helden Riesling Spätlese'])
add('Van Volxem', DE, MOSEL, 'Saar', null, RIES, ['Van Volxem Scharzhofberg Riesling'])
add('Heymann-Löwenstein', DE, MOSEL, null, null, RIES, ['Heymann-Löwenstein Uhlen Riesling'])
add('Clemens Busch', DE, MOSEL, null, null, RIES, ['Clemens Busch Marienburg Riesling'])

// ============================================================
// RIOJA & RIBERA DEL DUERO (Spain)
// ============================================================
const ES = 'Spain'
const TEMP = 'Tempranillo'

add('Vega Sicilia', ES, 'Ribera del Duero', null, 'Reserva', TEMP, ['Vega Sicilia Único', 'Vega Sicilia Valbuena 5°'])
add('Dominio de Pingus', ES, 'Ribera del Duero', null, null, TEMP, ['Dominio de Pingus', 'Pingus Flor de Pingus'])
add('R. López de Heredia', ES, 'Rioja', null, 'Gran Reserva', TEMP, ['López de Heredia Viña Tondonia Gran Reserva'])
add('R. López de Heredia', ES, 'Rioja', null, 'Reserva', TEMP, ['López de Heredia Viña Tondonia Reserva'])
add('La Rioja Alta', ES, 'Rioja', null, 'Gran Reserva', TEMP, ['La Rioja Alta Gran Reserva 904'])
add('La Rioja Alta', ES, 'Rioja', null, 'Reserva', TEMP, ['La Rioja Alta Viña Ardanza Reserva'])
add('Marqués de Murrieta', ES, 'Rioja', null, 'Gran Reserva', TEMP, ['Marqués de Murrieta Castillo Ygay Gran Reserva'])
add('CVNE', ES, 'Rioja', null, 'Gran Reserva', TEMP, ['CVNE Imperial Gran Reserva'])
add('Bodegas Muga', ES, 'Rioja', null, 'Gran Reserva', TEMP, ['Muga Prado Enea Gran Reserva'])
add('Bodegas Muga', ES, 'Rioja', null, null, 'Red Blend', ['Muga Aro'])
add('Artadi', ES, 'Rioja', null, null, TEMP, ['Artadi Viña El Pisón'])
add('Roda', ES, 'Rioja', null, 'Reserva', TEMP, ['Roda I Reserva'])
add('Remírez de Ganuza', ES, 'Rioja', null, 'Reserva', TEMP, ['Remírez de Ganuza Reserva'])
add('Bodegas Contino', ES, 'Rioja', null, null, TEMP, ['Contino Viña del Olivo'])
add('Aalto', ES, 'Ribera del Duero', null, null, TEMP, ['Aalto Ribera del Duero'])
add('Bodegas Hermanos Sastre', ES, 'Ribera del Duero', null, null, TEMP, ['Sastre Pesus Ribera del Duero'])

// ============================================================
// OTHER PREMIUM REGIONS
// ============================================================
// Priorat (Spain)
add('Clos Mogador', ES, 'Priorat', null, null, 'Red Blend', ['Clos Mogador Priorat'])
add('Alvaro Palacios', ES, 'Priorat', null, null, 'Grenache', ['Alvaro Palacios L\'Ermita Priorat', 'Alvaro Palacios Finca Dofí'])

// Douro / Port (Portugal)
const PT = 'Portugal'
add('Taylor Fladgate', PT, 'Douro', null, null, 'Port', ['Taylor Fladgate Vintage Port', 'Taylor Fladgate 20 Year Old Tawny Port'])
add('Graham\'s', PT, 'Douro', null, null, 'Port', ['Graham\'s Vintage Port'])
add('Fonseca', PT, 'Douro', null, null, 'Port', ['Fonseca Vintage Port'])
add('Niepoort', PT, 'Douro', null, null, 'Port', ['Niepoort Vintage Port'])
add('Quinta do Noval', PT, 'Douro', null, null, 'Port', ['Quinta do Noval Nacional Vintage Port'])
add('Dow\'s', PT, 'Douro', null, null, 'Port', ['Dow\'s Vintage Port'])

// Coonawarra (Australia)
add('Wynns Coonawarra Estate', AU, 'Coonawarra', null, null, CS, ['Wynns Coonawarra Estate John Riddoch Cabernet Sauvignon'])
add('Bowen Estate', AU, 'Coonawarra', null, null, CS, ['Bowen Estate Cabernet Sauvignon'])

// New Zealand
const NZ = 'New Zealand'
add('Cloudy Bay', NZ, 'Marlborough', null, null, 'Sauvignon Blanc', ['Cloudy Bay Sauvignon Blanc'])
add('Felton Road', NZ, 'Central Otago', null, null, PN, ['Felton Road Bannockburn Pinot Noir'])
add('Te Mata Estate', NZ, 'Hawke\'s Bay', null, null, BB, ['Te Mata Coleraine'])

// Washington State (United States)
add('Quilceda Creek', US, 'Columbia Valley', null, null, CS, ['Quilceda Creek Cabernet Sauvignon'])
add('Leonetti Cellar', US, 'Columbia Valley', 'Walla Walla Valley', null, CS, ['Leonetti Cellar Reserve'])
add('Chateau Ste. Michelle', US, 'Columbia Valley', null, null, CS, ['Chateau Ste. Michelle Ethos Reserve Cabernet Sauvignon'])

// Oregon (United States)
add('Domaine Drouhin Oregon', US, 'Willamette Valley', null, null, PN, ['Domaine Drouhin Oregon Pinot Noir'])
add('Cristom Vineyards', US, 'Willamette Valley', null, null, PN, ['Cristom Mt. Jefferson Cuvée Pinot Noir'])
add('Bergström Wines', US, 'Willamette Valley', null, null, PN, ['Bergström Shea Vineyard Pinot Noir'])

// South Africa
const ZA = 'South Africa'
add('Kanonkop', ZA, 'Stellenbosch', null, null, BB, ['Kanonkop Paul Sauer'])
add('Klein Constantia', ZA, 'Constantia', null, null, 'White Blend', ['Klein Constantia Vin de Constance'])

// Argentina
const AR = 'Argentina'
add('Catena Zapata', AR, 'Mendoza', null, null, 'Malbec', ['Catena Zapata Nicolás Catena Zapata', 'Catena Zapata Adrianna Vineyard Malbec'])
add('Achaval Ferrer', AR, 'Mendoza', null, null, 'Malbec', ['Achaval Ferrer Finca Altamira Malbec'])

// Chile
const CL = 'Chile'
add('Almaviva', CL, 'Maipo Valley', null, null, BB, ['Almaviva'])
add('Concha y Toro', CL, 'Maipo Valley', null, null, CS, ['Don Melchor Cabernet Sauvignon'])
add('Viña Seña', CL, 'Aconcagua Valley', null, null, BB, ['Seña'])

// ============================================================
// ALSACE & LOIRE (France)
// ============================================================
add('Domaine Zind-Humbrecht', FR, 'Alsace', null, 'Grand Cru', RIES, ['Zind-Humbrecht Clos Saint Urbain Riesling'])
add('Domaine Zind-Humbrecht', FR, 'Alsace', null, 'Grand Cru', 'Pinot Grigio / Pinot Gris', ['Zind-Humbrecht Rangen de Thann Pinot Gris'])
add('Domaine Weinbach', FR, 'Alsace', null, null, RIES, ['Domaine Weinbach Riesling Schlossberg'])
add('Domaine Marcel Deiss', FR, 'Alsace', null, 'Grand Cru', 'White Blend', ['Marcel Deiss Altenberg de Bergheim'])
add('Maison Trimbach', FR, 'Alsace', null, null, RIES, ['Trimbach Riesling Clos Sainte Hune'])
add('Domaine Huet', FR, 'Loire Valley', 'Vouvray', null, 'Chenin Blanc', ['Domaine Huet Le Mont Vouvray Sec', 'Domaine Huet Clos du Bourg Moelleux'])
add('Domaine Didier Dagueneau', FR, 'Loire Valley', 'Pouilly-Fumé', null, 'Sauvignon Blanc', ['Didier Dagueneau Silex', 'Didier Dagueneau Pur Sang'])
add('Château de Tracy', FR, 'Loire Valley', 'Pouilly-Fumé', null, 'Sauvignon Blanc', ['Château de Tracy Pouilly-Fumé'])
add('Domaine Vacheron', FR, 'Loire Valley', 'Sancerre', null, 'Sauvignon Blanc', ['Domaine Vacheron Sancerre Les Romains'])

const outPath = path.join(process.cwd(), 'public', 'wine-data.json')
writeFileSync(outPath, JSON.stringify(wines, null, 2))
console.log(`Wrote ${wines.length} wines to ${outPath}`)
