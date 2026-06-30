const fs = require('fs');
const content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const matchToReplace = `    const fetchCatalogue = async () => {
        try {
            // Fetch DB Products
            let prodQuery = supabase.from('nutrition_products').select('*');
            const { data: dbProds } = await prodQuery;
            if (dbProds && dbProds.length > 0) {
                const grouped = dbProds.reduce((acc: any, p: any) => {
                    if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                    acc[p.categorie_nom].produits.push(p);
                    return acc;
                }, {});
                setShopDataDB(Object.values(grouped));
            } else {
                const grouped = SHOP_DATA.reduce((acc: any, p: any) => {
                    if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                    p.produits.forEach((prod: any) => acc[p.categorie_nom].produits.push(prod));
                    return acc;
                }, {});
                setShopDataDB(Object.values(grouped));
            }

            // Fetch Promo Codes
            let promoQuery = supabase.from('nutrition_promo_codes').select('*').eq('active', true);
            const { data: dbPromos } = await promoQuery;
            if (dbPromos) setShopPromoCodesDB(dbPromos);

            // Fetch Community Posts
            const { data: cPosts } = await supabase.from('nutrition_community_posts').select('*, clients(full_name)').order('created_at', { ascending: false });
            if (cPosts) {
                setCommunityPosts(cPosts.map((p: any) => ({
                    ...p,
                    client: p.clients?.full_name || 'Membre'
                })));
            }

            // Fetch Foods
            const { data: dbFoods } = await supabase.from('nutrition_foods').select('*');
            if (dbFoods) setFoodDatabaseDB(dbFoods);

            // Fetch All Recipes for Gallery
            let recipeQuery = supabase.from('nutrition_recipes').select('*');
            const { data: dbRecipes } = await recipeQuery;
            if (dbRecipes && dbRecipes.length > 0) setAllRecipesDB(dbRecipes);
            else setAllRecipesDB(DEFAULT_RECIPES);

            // Fetch Articles
            const { data: articlesData } = await supabase.from('marketing_articles').select('*').order('created_at', { ascending: false });
            if (articlesData) setArticles(articlesData);
        } catch (err) {
            console.error("Erreur de chargement du catalogue :", err);
        }
    };

    fetchCatalogue();`;

const replacement = `    useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                // Fetch DB Products
                let prodQuery = supabase.from('nutrition_products').select('*');
                const { data: dbProds } = await prodQuery;
                if (dbProds && dbProds.length > 0) {
                    const grouped = dbProds.reduce((acc: any, p: any) => {
                        if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                        acc[p.categorie_nom].produits.push(p);
                        return acc;
                    }, {});
                    setShopDataDB(Object.values(grouped));
                } else {
                    const grouped = SHOP_DATA.reduce((acc: any, p: any) => {
                        if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                        p.produits.forEach((prod: any) => acc[p.categorie_nom].produits.push(prod));
                        return acc;
                    }, {});
                    setShopDataDB(Object.values(grouped));
                }

                // Fetch Promo Codes
                let promoQuery = supabase.from('nutrition_promo_codes').select('*').eq('active', true);
                const { data: dbPromos } = await promoQuery;
                if (dbPromos) setShopPromoCodesDB(dbPromos);

                // Fetch Community Posts
                const { data: cPosts } = await supabase.from('nutrition_community_posts').select('*, clients(full_name)').order('created_at', { ascending: false });
                if (cPosts) {
                    setCommunityPosts(cPosts.map((p: any) => ({
                        ...p,
                        client: p.clients?.full_name || 'Membre'
                    })));
                }

                // Fetch Foods
                const { data: dbFoods } = await supabase.from('nutrition_foods').select('*');
                if (dbFoods) setFoodDatabaseDB(dbFoods);

                // Fetch All Recipes for Gallery
                let recipeQuery = supabase.from('nutrition_recipes').select('*');
                const { data: dbRecipes } = await recipeQuery;
                if (dbRecipes && dbRecipes.length > 0) setAllRecipesDB(dbRecipes);
                else setAllRecipesDB(DEFAULT_RECIPES);

                // Fetch Articles
                const { data: articlesData } = await supabase.from('marketing_articles').select('*').order('created_at', { ascending: false });
                if (articlesData) setArticles(articlesData);
            } catch (err) {
                console.error("Erreur de chargement du catalogue :", err);
            }
        };

        fetchCatalogue();
    }, []);`;

const newContent = content.replace(matchToReplace, replacement);

fs.writeFileSync('src/app/nutrition/page.tsx', newContent);
