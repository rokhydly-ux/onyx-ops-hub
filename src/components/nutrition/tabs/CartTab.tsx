import React from 'react';
import { QUARTIERS, DELIVERY_ZONES } from '@/store/useCartStore';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Truck, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function CartTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress } = tabProps;

  return (
    <>

           <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
              <button onClick={() => handleTabChange('shop')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à la boutique</button>

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-zinc-200">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-8">Mon Panier</h2>

                  {shopCart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-400">
                              <ShoppingBag size={48} />
                          </div>
                          <h2 className="text-2xl font-black uppercase text-black mb-2">Votre panier est vide</h2>
                          <p className="text-zinc-500 font-bold mb-8">Découvrez nos produits nutritionnels pour atteindre vos objectifs.</p>
                          <button onClick={() => handleTabChange('shop')} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg hover:scale-105 transition-transform">
                              Aller à la boutique
                          </button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                          <div className="lg:col-span-8 flex flex-col gap-6">
                              {shopCart.map((item: any) => (
                                  <div key={item.id} className="flex gap-4 p-4 border border-zinc-100 rounded-2xl relative shadow-sm">
                                      <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 bg-zinc-50 rounded-full"><Trash2 size={16}/></button>
                                      <div className="w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                          {item.image_url ? <img src={item.image_url} alt={item.nom} className="w-full h-full object-cover"/> : <Box size={32} className="text-zinc-300"/>}
                                      </div>
                                      <div className="flex-1 flex flex-col justify-between py-1 pr-8">
                                          <div>
                                              <h3 className="font-bold text-sm text-black mb-1 line-clamp-1">{item.nom}</h3>
                                              <p className="text-xs text-zinc-500 font-medium">Prix unitaire: {(item.finalPrice || item.prix_premium || item.prix_standard || 0).toLocaleString()} F</p>
                                          </div>
                                          <div className="flex items-center justify-between mt-2">
                                              <p className="font-black text-lg text-[#39FF14]">
                                                  {((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)).toLocaleString()} F
                                              </p>
                                              <div className="flex items-center gap-4 bg-zinc-100 rounded-xl p-1 px-2 border border-zinc-200">
                                                  <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:text-[#39FF14] text-black"><Minus size={14}/></button>
                                                  <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                                  <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:text-[#39FF14] text-black"><Plus size={14}/></button>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          {/* CHECKOUT SIDEBAR */}
                          <div className="lg:col-span-4">
                              <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 sticky top-24">
                                  <h3 className="font-black text-lg uppercase mb-6 flex items-center gap-2"><ShoppingCart size={20} className="text-[#39FF14]"/> Récapitulatif</h3>

                                  {(() => {
                                      const subTotal = shopCart.reduce((acc, item: any) => acc + ((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)), 0);
                                      // Jauge de livraison
                                      const progress = Math.min(100, (subTotal / 30000) * 100);
                                      const remaining = Math.max(0, 30000 - subTotal);
                                      const isFreeDelivery = subTotal >= 30000;

                                      // Base delivery
                                      const dCost = deliveryCost || 1500;
                                      const finalDeliveryCost = isFreeDelivery ? Math.max(0, dCost - 1500) : dCost;
                                      const total = subTotal + finalDeliveryCost;

                                      return (
                                        <div className="flex flex-col gap-4">
                                            {/* Delivery Progress Bar */}
                                            <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                                                <div className="flex justify-between items-end mb-2">
                                                    <p className="text-[10px] font-black uppercase text-zinc-500">Subvention Livraison</p>
                                                    <p className="text-xs font-bold text-black">{isFreeDelivery ? 'Acquise ✅' : `Encore ${remaining.toLocaleString()} F`}</p>
                                                </div>
                                                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#39FF14] transition-all duration-500" style={{width: `${progress}%`}}></div>
                                                </div>
                                                {!isFreeDelivery && <p className="text-[9px] text-zinc-400 mt-2">Atteignez 30 000 F pour obtenir -1500F sur la livraison.</p>}
                                            </div>

                                            <div className="flex justify-between text-sm font-bold text-zinc-600 mt-4">
                                                <span>Sous-total</span>
                                                <span>{subTotal.toLocaleString()} F</span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between text-sm font-bold text-zinc-600">
                                                    <span>Livraison</span>
                                                    <span className={isFreeDelivery ? 'text-[#39FF14]' : ''}>{finalDeliveryCost === 0 ? 'Offerte' : `+ ${finalDeliveryCost.toLocaleString()} F`}</span>
                                                </div>
                                                <select value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black mt-2">
<option value="">Sélectionnez votre zone de livraison</option>
{QUARTIERS.map(q => (
<option key={q} value={q}>{q} ({DELIVERY_ZONES[q]} F)</option>
))}
</select>
<input type="text" placeholder="Détails de l'adresse (rue, bâtiment...)" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black mt-2" />
<input type="text" placeholder="Code Promo" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black mt-2" />

                                            </div>

                                            <div className="h-px bg-zinc-200 my-2"></div>

                                            <div className="flex justify-between items-center mb-6">
                                                <span className="font-black text-lg uppercase">Total</span>
                                                <span className="text-3xl font-black text-[#39FF14]">{total.toLocaleString()} F</span>
                                            </div>


                                            <div className="space-y-3">
                                                <button onClick={async () => {
                                                    if (!deliveryAddress.trim()) return alert("Veuillez renseigner votre adresse de livraison.");
                                                    try {
                                                        const orderIdStr = Math.random().toString(36).substring(2, 10).toUpperCase();
                                                        const { data, error } = await supabase.from('nutrition_orders').insert({
                                                            client_id: clientProfile?.id || user?.id,
                                                            client_name: user?.user_metadata?.full_name || 'Inconnu',
                                                            phone: clientProfile?.phone || '',
                                                            items: shopCart.map((p: any) => ({ id: p.id, nom: p.nom, quantity: p.quantity, finalPrice: p.finalPrice })),
                                                            total: total,
                                                            status: 'Nouveau',
                                                            address: deliveryAddress
                                                        }).select();
                                                        if (error) throw error;
                                                        clearCart();
                                                        setShopPromoCode('');
                                                        alert(`FÉLICITATIONS ${user?.user_metadata?.full_name || ''}, votre commande #${orderIdStr} est enregistrée !`);
                                                        handleTabChange('orders');
                                                    } catch (err: any) { alert("Erreur: " + err.message); }
                                                }} className="w-full bg-[#E5F1FB] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 border border-blue-200">
                                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsRgMYeeKcAxZzAMzyyiIjwO0N7csTtSMzVEjQ91U79w&s" className="h-6" alt="Wave"/> PAYER AVEC WAVE
                                                </button>

                                                <button onClick={async () => {
                                                    if (!deliveryAddress.trim()) return alert("Veuillez renseigner votre adresse de livraison.");
                                                    try {
                                                        const orderIdStr = Math.random().toString(36).substring(2, 10).toUpperCase();
                                                        const { data, error } = await supabase.from('nutrition_orders').insert({
                                                            client_id: clientProfile?.id || user?.id,
                                                            client_name: user?.user_metadata?.full_name || 'Inconnu',
                                                            phone: clientProfile?.phone || '',
                                                            items: shopCart.map((p: any) => ({ id: p.id, nom: p.nom, quantity: p.quantity, finalPrice: p.finalPrice })),
                                                            total: total,
                                                            status: 'Nouveau',
                                                            address: deliveryAddress
                                                        }).select();
                                                        if (error) throw error;
                                                        clearCart();
                                                        setShopPromoCode('');
                                                        alert(`FÉLICITATIONS ${user?.user_metadata?.full_name || ''}, votre commande #${orderIdStr} est enregistrée !`);
                                                        handleTabChange('orders');
                                                    } catch (err: any) { alert("Erreur: " + err.message); }
                                                }} className="w-full bg-orange-100 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 border border-orange-200">
                                                    <img src="https://dimelo-answers-production.s3-eu-west-1.amazonaws.com/268/6f44dfa59e0bcf0b/om_logo_original.png?09c0932" className="h-6" alt="Orange Money"/> PAYER AVEC ORANGE MONEY
                                                </button>

                                                <button onClick={async () => {
                                                    if (!deliveryAddress.trim()) return alert("Veuillez renseigner votre adresse de livraison.");
                                                    try {
                                                        const orderIdStr = Math.random().toString(36).substring(2, 10).toUpperCase();
                                                        const { data, error } = await supabase.from('nutrition_orders').insert({
                                                            client_id: clientProfile?.id || user?.id,
                                                            client_name: user?.user_metadata?.full_name || 'Inconnu',
                                                            phone: clientProfile?.phone || '',
                                                            items: shopCart.map((p: any) => ({ id: p.id, nom: p.nom, quantity: p.quantity, finalPrice: p.finalPrice })),
                                                            total: total,
                                                            status: 'Nouveau',
                                                            address: deliveryAddress
                                                        }).select();
                                                        if (error) throw error;
                                                        clearCart();
                                                        setShopPromoCode('');
                                                        alert(`FÉLICITATIONS ${user?.user_metadata?.full_name || ''}, votre commande #${orderIdStr} est enregistrée !`);
                                                        handleTabChange('orders');
                                                    } catch (err: any) { alert("Erreur: " + err.message); }
                                                }} className="w-full bg-zinc-100 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 border border-zinc-200">
                                                    <Truck size={20} /> PAIEMENT À LA LIVRAISON
                                                </button>
                                            </div>


                                            <button onClick={async () => {
                                                if (!deliveryAddress.trim()) return alert("Veuillez renseigner votre adresse de livraison.");

                                                try {
                                                    const orderIdStr = Math.random().toString(36).substring(2, 10).toUpperCase();

                                                    const { data, error } = await supabase.from('nutrition_orders').insert({
                                                        client_id: clientProfile?.id || user?.id,
                                                        client_name: user?.user_metadata?.full_name || 'Inconnu',
                                                        phone: clientProfile?.phone || '',
                                                        items: shopCart.map((p: any) => ({ id: p.id, nom: p.nom, quantity: p.quantity, finalPrice: p.finalPrice })),
                                                        total: total,
                                                        status: 'Nouveau',
                                                        address: deliveryAddress
                                                    }).select();

                                                    if (error) throw error;

                                                    const cartText = shopCart.map((item: any) => `- ${item.quantity}x ${item.nom}`).join('\n');
                                                    const orderId = data[0].id;
                                                    clearCart();

                                                    const msg = `🛍️ NOUVELLE COMMANDE\nN°${orderIdStr}\nTotal: ${total.toLocaleString()} FCFA\nAdmin: https://nutriafro.app/admin/orders/${orderId}`;
                                                    window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, "_blank");

                                                    handleTabChange('orders');

                                                } catch (err: any) {
                                                    alert("Erreur: " + err.message);
                                                }
                                            }} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/20 mt-2">
                                                COMMANDER VIA WHATSAPP
                                            </button>
                                        </div>
                                      );
                                  })()}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Cross-selling (Récemment vus) */}
                  <div className="mt-16 pt-8 border-t border-zinc-200">
                      <h3 className="font-black text-xl uppercase mb-6 flex items-center gap-2 text-black"><Eye size={20} className="text-black"/> Récemment vus</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {savedShopProducts.slice(0, 4).map((p: any) => (
                             <div key={p.id} onClick={() => { handleTabChange('shop'); }} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:border-black transition-colors">
                                 <div className="w-20 h-20 rounded-xl overflow-hidden mb-3 bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                     {p.image_url ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover"/> : <Box size={24} className="text-zinc-300"/>}
                                 </div>
                                 <h3 className="font-bold text-xs text-black mb-1 line-clamp-1">{p.nom}</h3>
                                 <p className="text-[#39FF14] font-black text-xs mb-2">{(p.prix_standard || 0).toLocaleString()} F</p>
                             </div>
                          ))}
                      </div>
                  </div>
              </div>
           </div>

    </>
  );
}
