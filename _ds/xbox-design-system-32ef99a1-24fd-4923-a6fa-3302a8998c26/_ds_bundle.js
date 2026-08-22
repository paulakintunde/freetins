/* @ds-bundle: {"format":4,"namespace":"XBOXDesignSystem_32ef99","components":[{"name":"LOGO","sourcePath":"assets/manifest.js"},{"name":"SOCIAL","sourcePath":"assets/manifest.js"},{"name":"GLYPH","sourcePath":"assets/manifest.js"},{"name":"IMAGE","sourcePath":"assets/manifest.js"},{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"LoadMore","sourcePath":"components/actions/LoadMore.jsx"},{"name":"TextLink","sourcePath":"components/actions/TextLink.jsx"},{"name":"CategoryList","sourcePath":"components/catalog/CategoryList.jsx"},{"name":"EmptyState","sourcePath":"components/catalog/EmptyState.jsx"},{"name":"FilterGroup","sourcePath":"components/catalog/FilterGroup.jsx"},{"name":"SearchField","sourcePath":"components/catalog/SearchField.jsx"},{"name":"SortSelect","sourcePath":"components/catalog/SortSelect.jsx"},{"name":"Badge","sourcePath":"components/commerce/Badge.jsx"},{"name":"ComparisonTable","sourcePath":"components/commerce/ComparisonTable.jsx"},{"name":"PriceTag","sourcePath":"components/commerce/PriceTag.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"SkuCard","sourcePath":"components/commerce/SkuCard.jsx"},{"name":"ContentPlacement","sourcePath":"components/content/ContentPlacement.jsx"},{"name":"Eyebrow","sourcePath":"components/content/Eyebrow.jsx"},{"name":"FeatureCard","sourcePath":"components/content/FeatureCard.jsx"},{"name":"Footnote","sourcePath":"components/content/Footnote.jsx"},{"name":"FootnoteRef","sourcePath":"components/content/Footnote.jsx"},{"name":"PageHero","sourcePath":"components/content/PageHero.jsx"},{"name":"SectionHeading","sourcePath":"components/content/SectionHeading.jsx"},{"name":"Tile","sourcePath":"components/content/Tile.jsx"},{"name":"Accordion","sourcePath":"components/disclosure/Accordion.jsx"},{"name":"Carousel","sourcePath":"components/disclosure/Carousel.jsx"},{"name":"Tooltip","sourcePath":"components/disclosure/Tooltip.jsx"},{"name":"GlobalNav","sourcePath":"components/shell/GlobalNav.jsx"},{"name":"XBOX_ICONS","sourcePath":"components/shell/Icon.jsx"},{"name":"Icon","sourcePath":"components/shell/Icon.jsx"},{"name":"SiteFooter","sourcePath":"components/shell/SiteFooter.jsx"},{"name":"CATEGORIES","sourcePath":"ui_kits/catalog/catalogData.js"},{"name":"CATEGORY_BLURBS","sourcePath":"ui_kits/catalog/catalogData.js"},{"name":"FACETS","sourcePath":"ui_kits/catalog/catalogData.js"},{"name":"SORTS","sourcePath":"ui_kits/catalog/catalogData.js"},{"name":"PRODUCTS","sourcePath":"ui_kits/catalog/catalogData.js"},{"name":"PRICES","sourcePath":"ui_kits/catalog/catalogData.js"},{"name":"EMPTY_STATES","sourcePath":"ui_kits/catalog/catalogData.js"}],"sourceHashes":{"assets/manifest.js":"9c4382c86b6c","components/actions/Button.jsx":"d2719c127a25","components/actions/LoadMore.jsx":"5c8b789f8290","components/actions/TextLink.jsx":"e723b77e7060","components/catalog/CategoryList.jsx":"b76415175757","components/catalog/EmptyState.jsx":"214a4cc2e0fe","components/catalog/FilterGroup.jsx":"4dbb5897f740","components/catalog/SearchField.jsx":"db69b5f9e197","components/catalog/SortSelect.jsx":"34ba6e6954f0","components/commerce/Badge.jsx":"5ea4fb363b92","components/commerce/ComparisonTable.jsx":"23737ef71af3","components/commerce/PriceTag.jsx":"6c5fc9d28c9e","components/commerce/ProductCard.jsx":"082cdf393941","components/commerce/SkuCard.jsx":"0c8250a983f0","components/content/ContentPlacement.jsx":"e90b025301bf","components/content/Eyebrow.jsx":"76aaaae05b74","components/content/FeatureCard.jsx":"e8407a413806","components/content/Footnote.jsx":"94aa25bb6d4d","components/content/PageHero.jsx":"440c82c69cec","components/content/SectionHeading.jsx":"af91f94ea867","components/content/Tile.jsx":"19dd96ede3b1","components/disclosure/Accordion.jsx":"0853258cbcf2","components/disclosure/Carousel.jsx":"d6981a4327f9","components/disclosure/Tooltip.jsx":"e2ee1a53a072","components/shell/GlobalNav.jsx":"9cc08d548510","components/shell/Icon.jsx":"9ca4b364c15f","components/shell/SiteFooter.jsx":"f78d78d7b2cb","ui_kits/catalog/AccessoriesCatalog.jsx":"2f6fa306fda7","ui_kits/catalog/catalogData.js":"429b5c39a2da","ui_kits/game-pass/GamePassPage.jsx":"5bf8d3718121","ui_kits/game-pass/PlanChart.jsx":"92e77e267b9d","ui_kits/marketing-site/CommunityHub.jsx":"17a5fa618c59","ui_kits/marketing-site/ConsolesCompare.jsx":"30372ca0f43d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.XBOXDesignSystem_32ef99 = window.XBOXDesignSystem_32ef99 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/manifest.js
try { (() => {
/* Central asset table. Swap these constants for local paths if you download the
   binaries. Every URL was read out of live xbox.com page source. */
const LOGO = {
  xbox: "https://uhf.microsoft.com/images/xbox/RW4ESm.png",
  xboxAlt: "https://uhf.microsoft.com/images/xbox/RW8TP2.png",
  microsoft: "https://uhf.microsoft.com/images/microsoft/RE1Mu3b.png",
  sphereOnGreen: "https://assets.xboxservices.com/assets/5c/55/5c554715-fac4-4c09-8006-d8e62d355157.jpg?n=Xbox_Sharing_Xbox-2019-White-on-Green_200x200.jpg",
  gamePass: "https://cms-assets.xboxservices.com/assets/dc/a1/dca12e01-f367-4d86-a2c8-1ef23bfd593a.png?n=Game-Pass_SKU-Chart-0_3x-XGP-Logo-540_1225x150.png",
  g4eBadge: "https://assets.xboxservices.com/assets/1f/6e/1f6e5620-7980-4def-bad3-5738ad1362af.svg?n=G4E-Hub_Badge-Thumbnail_130x150.svg"
};
const SOCIAL = {
  mail: "https://assets.xboxservices.com/assets/f8/67/f86740d7-eedd-4d9c-a963-76af7e36c4b2.svg?n=Xbox-Follow-Footer_Image-0_Mail_32x32_02.svg",
  facebook: "https://assets.xboxservices.com/assets/45/e3/45e3942b-7e08-4f7a-9e78-7b073d07118f.svg?n=Xbox-Follow-Footer_Image-0_Facebook_32x32_02.svg",
  x: "https://assets.xboxservices.com/assets/c9/71/c971845d-5e9d-4f26-8426-b71b9910b183.svg?n=Xbox-Follow-Footer_Image-0_X_32x32_02.svg",
  instagram: "https://assets.xboxservices.com/assets/21/a4/21a47e36-c00c-4fb0-bd18-bc72cfc41e5d.svg?n=Xbox-Follow-Footer_Image-0_Instagram_32x32_02.svg",
  whatsapp: "https://assets.xboxservices.com/assets/94/ca/94ca9c9a-22cf-4d0f-b76d-60cefb1f76b4.svg?n=Xbox-Follow-Footer_Image-0_Whatsapp_32x32_02.svg",
  tiktok: "https://assets.xboxservices.com/assets/e9/38/e9389fa4-7e2f-4f25-860d-3ada8618dbda.svg?n=Xbox-Follow-Footer_Image-0_TikTok_32x32_02.svg",
  youtube: "https://assets.xboxservices.com/assets/48/8d/488d5ad9-d9fa-48dc-a0c8-020a35333edb.svg?n=Xbox-Follow-Footer_Image-0_YouTube_32x32_01.svg",
  linkedin: "https://cms-assets.xboxservices.com/assets/67/27/67276182-bc71-4ac8-b4d4-17eaa2d6950e.svg?n=MWF-Xbox-Template-2025_LinkedIn-Dark.svg"
};
const GLYPH = {
  accordion: "https://assets.xboxservices.com/assets/96/3b/963b4c40-5f82-4fa6-9869-ae7de34a91af.svg?n=Charlie_Accordion_OpenButton.svg",
  arrowLeft: "https://assets.xboxservices.com/assets/ce/11/ce11f6ec-387e-4cc4-8c9f-b54cd07cb484.png?n=leftArrow.png",
  arrowRight: "https://assets.xboxservices.com/assets/d6/e3/d6e36946-1187-42e4-9037-5a4374778483.png?n=rightArrow.png",
  close: "https://assets.xboxservices.com/assets/9b/7b/9b7bdeb0-0cf2-46f6-a4ff-be0fceffdee9.svg?n=Games-Catalog_Image-0_X-Button_230x120.svg",
  compare: "https://cms-assets.xboxservices.com/assets/04/4c/044ccec2-2f48-4617-8134-2d6ed7158787.svg?n=Game-Pass_SKU-Chart-0_Compare_130x88.svg",
  gift: "https://cms-assets.xboxservices.com/assets/b6/c4/b6c42196-084e-4111-ad36-483d2707da90.svg?n=Game-Pass_SKU-Chart-0_Gift_130x88.svg",
  renew: "https://cms-assets.xboxservices.com/assets/97/81/9781bc02-5a8b-4144-90a3-eed8da788baf.svg?n=Game-Pass_SKU-Chart-0_Renew_130x88.svg",
  placeholder40: "https://assets.xboxservices.com/assets/e7/bc/e7bceaa7-87c5-439f-8147-2d2641ce1c67.png?n=image-small-40x40-transparent.png",
  skeleton: "https://assets.xboxservices.com/assets/02/53/0253acf0-6ff3-4706-b885-90fa863c4285.gif?n=Skeleton_960x540.gif"
};
const IMAGE = {
  featureInclusive: "https://cms-assets.xboxservices.com/assets/ba/70/ba70ff27-234a-40c3-824c-f63ab19fbf05.jpg?n=G4E-Hub_Feature-768_Inclusive_800x1000.jpg",
  featureAccessible: "https://cms-assets.xboxservices.com/assets/3f/14/3f14868e-b415-4261-a78f-4556e984f0ff.jpg?n=G4E-Hub_Feature-768_Accessible_800x1000.jpg",
  featureSafe: "https://cms-assets.xboxservices.com/assets/a9/e0/a9e0f6b5-0e2c-43ae-8b23-62f04ae8621a.jpg?n=G4E-Hub_Feature-768_Safe_800x1000.jpg",
  tileLargeAccessibility: "https://assets.xboxservices.com/assets/38/dd/38dd784b-85ea-46f4-b528-c08db64cb436.jpg?n=Community-Hub_Large-Tile-1084_Accessibility_1258x629.jpg",
  tileMediumMinecraft: "https://assets.xboxservices.com/assets/a9/8f/a98fa8e5-c486-4dae-b3da-405df93a0be0.jpg?n=Community-Hub_Medium-Tile-1084_Minecraft-Cyber-Safe_528x534.jpg",
  tileMediumForza: "https://assets.xboxservices.com/assets/41/6a/416a4898-fc52-4a6d-92a4-0eca7720c08c.jpg?n=Community-Hub_Medium-Tile-1084_Forza-Blind-Assists_528x534.jpg",
  tileSmallIndigenous: "https://assets.xboxservices.com/assets/c8/d3/c8d3491d-ae83-498c-b4af-8d428199b22f.jpg?n=Community-Hub_Small-Tile-1084_10398402_528x320.jpg",
  tileSmallTransparency: "https://assets.xboxservices.com/assets/40/e8/40e82073-d74a-4e58-8e26-986aa3f44fcf.jpg?n=Community-Hub_Small-Tile-1084_Transparency-Report_528x320.jpg",
  placementStandards: "https://assets.xboxservices.com/assets/fa/ed/faed284a-7b32-434d-b0fa-a2f635376b5c.jpg?n=G4E-Hub_Content-Placement-0_Community-Standards_788x444.jpg",
  placementInsider: "https://assets.xboxservices.com/assets/2f/79/2f795b30-4def-4bc8-8cfc-99537febc160.jpg?n=G4E-Hub_Content-Placement-0_Xbox-Insider-Program_788x444.jpg",
  placementRewards: "https://assets.xboxservices.com/assets/f3/50/f35053f4-ca38-4b13-9066-4112a9c8ca81.jpg?n=G4E-Hub_Content-Placement-0_Rewards_788x444.jpg",
  placementFanFest: "https://assets.xboxservices.com/assets/2e/ee/2eee6774-0fbf-4308-b5d7-33eeee4fab4c.jpg?n=G4E-Hub_Content-Placement-0_FanFest_788x444.jpg",
  sliderFortnite: "https://cms-assets.xboxservices.com/assets/a0/99/a09941c8-b9dc-4476-ae00-9580c4328da5.jpg?n=XGP-PMP_Sneak-Slider-0_Fortnite-Crew-2026_832x572.jpg",
  sliderEaPlay: "https://cms-assets.xboxservices.com/assets/6c/0e/6c0ec3bc-53cb-4465-8d1d-9958d07a09dc.jpg?n=XGP_Sneak-Slider-0_EA-Play-06-26_832x572.jpg",
  sliderUbisoft: "https://cms-assets.xboxservices.com/assets/e0/58/e05821a9-2c00-400b-b9f4-294b7b768077.jpg?n=1254895_Sneak-Slider-0_02_832x572.jpg",
  sliderCloud: "https://cms-assets.xboxservices.com/assets/65/61/656100b9-c32a-4e61-aade-cbe4b5e18279.jpg?n=1254895_Sneak-Slider-0_cloud_832x572.jpg",
  sliderBenefits: "https://cms-assets.xboxservices.com/assets/6c/ba/6cbaf843-a441-435f-8a7a-1a42fd5b9166.jpg?n=1254895_Sneak-Slider-0_in-game-benefits_832x572.jpg",
  sliderRewards: "https://cms-assets.xboxservices.com/assets/fa/8e/fa8e2cd1-18e6-462e-b7ab-45f24e4dcfbe.jpg?n=1254895_Sneak-Slider-0_rewards_832x572_02.jpg",
  sliderMultiplayer: "https://cms-assets.xboxservices.com/assets/1f/91/1f919f03-0ef3-4d52-99a2-fcf773e3917a.jpg?n=1254895_Sneak-Slider-0_multiplayer_832x572.jpg",
  sliderDeals: "https://cms-assets.xboxservices.com/assets/08/f6/08f635e4-f38d-4aff-8c10-63351eaa252e.jpg?n=1254895_Sneak-Slider-0_discounts_832x572.jpg",
  devicesWide: "https://cms-assets.xboxservices.com/assets/6f/15/6f15a743-d7f9-4df7-aa34-791f9754c5da.jpg?n=XGP-PMP_Image-0_Devices-2x_3840x1440_01.jpg",
  pledgeShare: "https://assets.xboxservices.com/assets/94/4c/944c9574-7ea3-4c4f-ab28-5199dcd254fa.jpg?n=G4E-Hub_Social-Share_1920x1080_02.jpg",
  empty404Minecraft: "https://assets.xboxservices.com/assets/3c/b5/3cb5bdf1-22f7-46cc-ad96-15050ecbd3da.jpg?n=Accessories-Hub_404-Image-0_MC-Dungeons_1200x675.jpg",
  empty404Grounded: "https://assets.xboxservices.com/assets/08/07/0807436a-b001-4097-be36-b0e5c0b9d09c.jpg?n=Accessories-Hub_404-Image-0_Grounded_1200x675.jpg",
  empty404Wasteland: "https://assets.xboxservices.com/assets/9d/6c/9d6c6ff4-9818-4ae5-b930-a78d899c73f9.jpg?n=Accessories-Hub_404-Image-0_Wasteland-3_1200x675.jpg",
  empty404SoT: "https://assets.xboxservices.com/assets/70/56/7056e799-3803-4187-8ca3-8fb7dbdc7ac1.jpg?n=Accessories-Hub_404-Image-0_SoT_1200x675%202.jpg",
  empty404Ori: "https://assets.xboxservices.com/assets/f9/20/f92009f1-8ed5-4922-8b5b-ccda80ff5c05.jpg?n=Accessories-Hub_404-Image-0_Ori_1200x675%202.jpg"
};
Object.assign(__ds_scope, { LOGO, SOCIAL, GLYPH, IMAGE });
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/manifest.js", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAD = {
  md: "11px 24px",
  lg: "15px 32px"
};
const FS = {
  md: "15px",
  lg: "15px"
};
function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  fullWidth = false,
  type = "button",
  children,
  ...rest
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    padding: PAD[size] || PAD.md,
    fontFamily: "var(--font-core)",
    fontSize: FS[size] || FS.md,
    fontWeight: "var(--fw-semibold)",
    lineHeight: "var(--lh-body)",
    letterSpacing: "var(--ls-caps-cta)",
    textTransform: "uppercase",
    textDecoration: "none",
    borderRadius: "var(--radius-0)",
    border: "1px solid transparent",
    cursor: disabled ? "default" : "pointer",
    width: fullWidth ? "100%" : "auto",
    minHeight: size === "lg" ? "52px" : "44px",
    transition: "background-color var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)",
    whiteSpace: "nowrap"
  };
  const variants = {
    primary: {
      background: "var(--action-primary-bg)",
      color: "var(--action-primary-fg)"
    },
    secondary: {
      background: "var(--action-secondary-bg)",
      color: "var(--action-secondary-fg)",
      borderColor: "var(--action-secondary-border)"
    },
    ghost: {
      background: "transparent",
      color: "var(--action-secondary-fg)",
      padding: "11px 0"
    }
  };
  const style = {
    ...base,
    ...(variants[variant] || variants.primary)
  };
  if (disabled) Object.assign(style, {
    background: "var(--action-disabled-bg)",
    color: "var(--action-disabled-fg)",
    borderColor: "transparent",
    pointerEvents: "none"
  });
  const hover = (e, on) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === "primary") el.style.background = on ? "var(--action-primary-bg-hover)" : "var(--action-primary-bg)";else el.style.background = on ? "var(--action-secondary-bg-hover)" : "transparent";
    if (variant === "ghost") el.style.textDecoration = on ? "underline" : "none";
  };
  const press = (e, on) => {
    if (disabled) return;
    e.currentTarget.style.transform = on ? "var(--press-scale)" : "none";
    if (variant === "primary") e.currentTarget.style.background = on ? "var(--action-primary-bg-active)" : "var(--action-primary-bg-hover)";
  };
  const handlers = {
    onMouseEnter: e => hover(e, true),
    onMouseLeave: e => {
      hover(e, false);
      press(e, false);
    },
    onMouseDown: e => press(e, true),
    onMouseUp: e => press(e, false)
  };
  if (href && !disabled) return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: style,
    onClick: onClick
  }, handlers, rest), children);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    style: style,
    onClick: onClick,
    disabled: disabled
  }, handlers, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/LoadMore.jsx
try { (() => {
function LoadMore({
  canLoadMore = true,
  canLoadFewer = false,
  onLoadMore,
  onLoadFewer,
  moreLabel = "Load more",
  fewerLabel = "Load fewer"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      justifyContent: "center",
      padding: "var(--space-8) 0"
    }
  }, canLoadFewer && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onLoadFewer
  }, fewerLabel), canLoadMore && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onLoadMore
  }, moreLabel));
}
Object.assign(__ds_scope, { LoadMore });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/LoadMore.jsx", error: String((e && e.message) || e) }); }

// components/actions/TextLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextLink({
  href = "#",
  variant = "cta",
  showChevron = false,
  children,
  ...rest
}) {
  const isCta = variant === "cta";
  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    fontFamily: "var(--font-core)",
    fontSize: isCta ? "15px" : "inherit",
    fontWeight: isCta ? "var(--fw-semibold)" : "var(--fw-regular)",
    letterSpacing: isCta ? "var(--ls-caps-cta)" : "var(--ls-body)",
    textTransform: isCta ? "uppercase" : "none",
    color: "var(--link-rest)",
    textDecoration: isCta ? "none" : "underline",
    textUnderlineOffset: "3px",
    cursor: "pointer",
    transition: "color var(--dur-fast) var(--ease-standard)"
  };
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: style,
    onMouseEnter: e => {
      e.currentTarget.style.color = "var(--link-hover)";
      e.currentTarget.style.textDecoration = "underline";
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = "var(--link-rest)";
      e.currentTarget.style.textDecoration = isCta ? "none" : "underline";
    }
  }, rest), children, showChevron && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: "11px",
      lineHeight: 1
    }
  }, "\u25B8"));
}
Object.assign(__ds_scope, { TextLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/TextLink.jsx", error: String((e && e.message) || e) }); }

// components/catalog/CategoryList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CategoryList({
  items = [],
  active,
  onSelect,
  title,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, rest), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, title), items.map(it => {
    const label = typeof it === "string" ? it : it.label;
    const on = active === label;
    return /*#__PURE__*/React.createElement("a", {
      key: label,
      href: typeof it !== "string" && it.href || "#",
      onClick: e => {
        if (onSelect) {
          e.preventDefault();
          onSelect(label);
        }
      },
      style: {
        fontFamily: "var(--font-core)",
        fontSize: "var(--fs-body)",
        lineHeight: "var(--lh-body)",
        color: on ? "var(--text-primary)" : "var(--text-secondary)",
        textDecoration: "none",
        paddingLeft: "var(--space-3)",
        borderLeft: on ? "2px solid var(--green-600)" : "2px solid transparent",
        transition: "color var(--dur-fast) var(--ease-standard)"
      },
      onMouseEnter: e => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.textDecoration = "underline";
      },
      onMouseLeave: e => {
        e.currentTarget.style.color = on ? "var(--text-primary)" : "var(--text-secondary)";
        e.currentTarget.style.textDecoration = "none";
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { CategoryList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/catalog/CategoryList.jsx", error: String((e && e.message) || e) }); }

// components/catalog/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  image,
  imageAlt = "",
  headline,
  body = "No results found. Try adjusting your filters.",
  actionLabel = "Clear filters",
  onAction,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      alignItems: "center",
      textAlign: "center",
      padding: "var(--space-12) var(--space-6)"
    }
  }, rest), image && /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: "600px",
      aspectRatio: "1200 / 675",
      overflow: "hidden",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  })), headline && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-h3)",
      lineHeight: "var(--lh-h3)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, headline), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, body), onAction && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onAction
  }, actionLabel));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/catalog/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/catalog/FilterGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FilterGroup({
  title,
  options = [],
  selected = [],
  onToggle,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("fieldset", _extends({
    style: {
      border: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, rest), /*#__PURE__*/React.createElement("legend", {
    style: {
      padding: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, title), options.map(o => {
    const val = typeof o === "string" ? o : o.label;
    const on = selected.includes(val);
    return /*#__PURE__*/React.createElement("label", {
      key: val,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        cursor: "pointer",
        fontFamily: "var(--font-core)",
        fontSize: "var(--fs-body)",
        lineHeight: "var(--lh-body)",
        color: on ? "var(--text-primary)" : "var(--text-secondary)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "20px",
        height: "20px",
        flex: "0 0 auto",
        display: "grid",
        placeItems: "center",
        border: on ? "1px solid var(--green-600)" : "1px solid var(--border-strong)",
        background: on ? "var(--green-600)" : "transparent",
        color: "var(--neutral-0)",
        fontSize: "12px",
        transition: "background var(--dur-fast) var(--ease-standard)"
      }
    }, on ? "\u2713" : ""), /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: on,
      onChange: () => onToggle && onToggle(val),
      style: {
        position: "absolute",
        opacity: 0,
        width: 0,
        height: 0
      }
    }), /*#__PURE__*/React.createElement("span", null, val, typeof o !== "string" && o.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-tertiary)"
      }
    }, " (", o.count, ")")));
  }));
}
Object.assign(__ds_scope, { FilterGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/catalog/FilterGroup.jsx", error: String((e && e.message) || e) }); }

// components/catalog/SearchField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SearchField({
  label = "Search",
  placeholder,
  value,
  onChange,
  onSubmit,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("form", _extends({
    role: "search",
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit(value);
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, rest), /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: "var(--lh-body-sm)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      border: "1px solid var(--border-strong)",
      background: "transparent"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "search",
    value: value,
    placeholder: placeholder || label,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      flex: 1,
      minWidth: 0,
      padding: "11px var(--space-3)",
      background: "transparent",
      border: "none",
      outline: "none",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-primary)"
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    "aria-label": "Search",
    style: {
      padding: "0 var(--space-4)",
      background: "transparent",
      border: "none",
      borderLeft: "1px solid var(--border-subtle)",
      color: "var(--text-primary)",
      cursor: "pointer",
      fontSize: "15px"
    }
  }, "\u26B2")));
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/catalog/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/catalog/SortSelect.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SortSelect({
  label = "Sort by",
  value,
  options = [],
  onChange,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, label, ":"), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      padding: "9px var(--space-3)",
      background: "transparent",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-0)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      cursor: "pointer"
    }
  }, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o,
    style: {
      color: "#000"
    }
  }, o))));
}
Object.assign(__ds_scope, { SortSelect });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/catalog/SortSelect.jsx", error: String((e && e.message) || e) }); }

// components/commerce/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  brand: {
    background: "var(--green-600)",
    color: "var(--neutral-0)"
  },
  neutral: {
    background: "var(--white-a12)",
    color: "var(--text-primary)"
  },
  discount: {
    background: "var(--green-neon)",
    color: "var(--neutral-1000)"
  },
  outline: {
    background: "transparent",
    color: "var(--text-primary)",
    boxShadow: "inset 0 0 0 1px var(--border-strong)"
  }
};
function Badge({
  tone = "brand",
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-block",
      padding: "5px 10px",
      fontFamily: "var(--font-core)",
      fontSize: "11px",
      fontWeight: "var(--fw-bold)",
      lineHeight: "var(--lh-caption)",
      letterSpacing: "var(--ls-eyebrow)",
      textTransform: "uppercase",
      borderRadius: "var(--radius-sm)",
      whiteSpace: "nowrap",
      ...(TONES[tone] || TONES.brand)
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/Badge.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ComparisonTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ComparisonTable({
  columns = [],
  sections = [],
  ...rest
}) {
  const cell = {
    padding: "var(--space-4) var(--space-3)",
    fontFamily: "var(--font-core)",
    fontSize: "var(--fs-body)",
    lineHeight: "var(--lh-body)",
    color: "var(--text-secondary)",
    verticalAlign: "top",
    textAlign: "center"
  };
  return /*#__PURE__*/React.createElement("table", _extends({
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, rest), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...cell,
      textAlign: "left",
      width: "28%"
    }
  }), columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      ...cell,
      color: "var(--text-primary)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--fs-h4)",
      lineHeight: "var(--lh-h4)",
      fontWeight: "var(--fw-semibold)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-display)"
    }
  }, c.title), c.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: "var(--space-1)",
      fontSize: "var(--fs-body-sm)",
      fontWeight: "var(--fw-regular)",
      color: "var(--text-tertiary)"
    }
  }, c.subtitle))))), sections.map((s, si) => /*#__PURE__*/React.createElement("tbody", {
    key: si
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    colSpan: columns.length + 1,
    style: {
      padding: "var(--space-8) var(--space-3) var(--space-3)",
      textAlign: "left",
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-h5)",
      lineHeight: "var(--lh-h5)",
      fontWeight: "var(--fw-semibold)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-display)",
      color: "var(--text-primary)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, s.label)), (s.rows || []).map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri,
    style: {
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("th", {
    scope: "row",
    style: {
      ...cell,
      textAlign: "left",
      color: "var(--text-tertiary)",
      fontWeight: "var(--fw-regular)"
    }
  }, r.label), (r.values || []).map((v, vi) => /*#__PURE__*/React.createElement("td", {
    key: vi,
    style: {
      ...cell,
      color: "var(--text-primary)"
    }
  }, v === true ? /*#__PURE__*/React.createElement("span", {
    "aria-label": "Included",
    style: {
      color: "var(--green-400)"
    }
  }, "\u2713") : v === false ? /*#__PURE__*/React.createElement("span", {
    "aria-label": "Not included",
    style: {
      color: "var(--text-disabled)"
    }
  }, "\u2014") : v)))))));
}
Object.assign(__ds_scope, { ComparisonTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ComparisonTable.jsx", error: String((e && e.message) || e) }); }

// components/commerce/PriceTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PriceTag({
  price,
  previousPrice,
  period,
  size = "md",
  ...rest
}) {
  const big = size === "lg";
  return /*#__PURE__*/React.createElement("p", _extends({
    style: {
      margin: 0,
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-2)",
      fontFamily: "var(--font-core)",
      color: "var(--text-primary)"
    }
  }, rest), previousPrice && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: big ? "15px" : "13px",
      color: "var(--text-tertiary)",
      textDecoration: "line-through"
    }
  }, previousPrice), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: big ? "var(--fs-h3)" : "var(--fs-h5)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1.1
    }
  }, price), period && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "var(--text-secondary)"
    }
  }, period));
}
Object.assign(__ds_scope, { PriceTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/PriceTag.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProductCard({
  image,
  imageAlt = "",
  title,
  subtitle,
  price,
  previousPrice,
  discount,
  href = "#",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      textDecoration: "none",
      color: "inherit"
    },
    onMouseEnter: e => {
      const i = e.currentTarget.querySelector("img");
      if (i) i.style.transform = "scale(1.03)";
    },
    onMouseLeave: e => {
      const i = e.currentTarget.querySelector("img");
      if (i) i.style.transform = "none";
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "1 / 1",
      overflow: "hidden",
      background: "var(--surface-card)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
      transition: "transform var(--dur-base) var(--ease-standard)"
    }
  }), discount && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "var(--space-3)",
      left: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "discount"
  }, discount))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: "var(--lh-body-sm)",
      color: "var(--text-tertiary)"
    }
  }, subtitle), price && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PriceTag, {
    price: price,
    previousPrice: previousPrice
  }))));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/commerce/SkuCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SkuCard({
  name,
  priceLine,
  footnoteMarker,
  badge,
  image,
  imageAlt = "",
  libraryLine,
  features = [],
  ctaLabel = "Select",
  ctaHref = "#",
  terms,
  featured = false,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("article", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-card)",
      border: featured ? "1px solid var(--green-600)" : "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-0)",
      overflow: "hidden",
      height: "100%"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-h3)",
      lineHeight: "var(--lh-h3)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, name), priceLine && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, priceLine, footnoteMarker && /*#__PURE__*/React.createElement("sup", {
    style: {
      fontSize: "10px",
      lineHeight: 0
    }
  }, footnoteMarker))), image && /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "16 / 9",
      overflow: "hidden",
      background: "var(--neutral-900)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  })), badge && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--space-6) 0"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, null, badge)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--space-6) var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    href: ctaHref,
    fullWidth: true
  }, ctaLabel), terms && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "11px",
      lineHeight: "var(--lh-caption)",
      fontStyle: "italic",
      color: "var(--text-legal)"
    }
  }, terms), libraryLine && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-primary)"
    }
  }, libraryLine), features.length > 0 && /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: "var(--space-3)",
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-4)"
    }
  }, features.map((f, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--green-400)",
      flex: "0 0 auto"
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("span", null, f))))));
}
Object.assign(__ds_scope, { SkuCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/SkuCard.jsx", error: String((e && e.message) || e) }); }

// components/content/ContentPlacement.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ContentPlacement({
  image,
  imageAlt = "",
  title,
  body,
  actions,
  layout = "stack",
  ...rest
}) {
  const row = layout === "row";
  return /*#__PURE__*/React.createElement("article", _extends({
    style: {
      display: "grid",
      gridTemplateColumns: row ? "minmax(0,1fr) minmax(0,1fr)" : "1fr",
      gap: row ? "var(--space-8)" : "var(--space-5)",
      alignItems: row ? "center" : "stretch"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "788 / 444",
      overflow: "hidden",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-h4)",
      lineHeight: "var(--lh-h4)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, body), actions));
}
Object.assign(__ds_scope, { ContentPlacement });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ContentPlacement.jsx", error: String((e && e.message) || e) }); }

// components/content/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Eyebrow({
  items,
  separator = "\u00B7",
  tone = "default",
  children,
  ...rest
}) {
  const label = items && items.length ? items.join(` ${separator} `) : children;
  return /*#__PURE__*/React.createElement("p", _extends({
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "13px",
      fontWeight: "var(--fw-bold)",
      lineHeight: "var(--lh-body-sm)",
      letterSpacing: "var(--ls-eyebrow)",
      textTransform: "uppercase",
      color: tone === "brand" ? "var(--text-brand)" : "var(--text-secondary)"
    }
  }, rest), label);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/content/FeatureCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FeatureCard({
  image,
  imageAlt = "",
  title,
  body,
  actions,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("article", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "800 / 1000",
      overflow: "hidden",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      transition: "transform var(--dur-slow) var(--ease-standard)"
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = "var(--image-hover-zoom)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "none";
    }
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-h3)",
      lineHeight: "var(--lh-h3)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, body), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "var(--space-3)"
    }
  }, actions));
}
Object.assign(__ds_scope, { FeatureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/FeatureCard.jsx", error: String((e && e.message) || e) }); }

// components/content/Footnote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Footnote({
  marker,
  title,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("li", _extends({
    style: {
      display: "flex",
      gap: "var(--space-2)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: "var(--lh-body-sm)",
      color: "var(--text-legal)",
      fontStyle: "italic",
      listStyle: "none"
    }
  }, rest), marker && /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: "normal",
      fontWeight: "var(--fw-semibold)",
      flex: "0 0 auto"
    }
  }, marker), /*#__PURE__*/React.createElement("span", null, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      fontStyle: "normal",
      display: "block",
      color: "var(--text-secondary)"
    }
  }, title), children));
}
function FootnoteRef({
  marker,
  href
}) {
  return /*#__PURE__*/React.createElement("sup", {
    style: {
      fontSize: "10px",
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, marker));
}
Object.assign(__ds_scope, { Footnote, FootnoteRef });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Footnote.jsx", error: String((e && e.message) || e) }); }

// components/content/PageHero.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PageHero({
  image,
  imageAlt = "",
  scrim = "left",
  align = "left",
  minHeight = "min(72vh, 720px)",
  eyebrow,
  title,
  body,
  actions,
  ...rest
}) {
  const scrimBg = scrim === "bottom" ? "var(--scrim-bottom)" : scrim === "flat" ? "var(--scrim-flat)" : "var(--scrim-left)";
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      position: "relative",
      minHeight,
      display: "flex",
      alignItems: "flex-end",
      overflow: "hidden",
      background: "var(--surface-page)"
    }
  }, rest), image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center"
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      inset: 0,
      background: scrimBg
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-16) var(--space-12)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align === "center" ? "center" : "left"
    }
  }, eyebrow, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-h1)",
      lineHeight: "var(--lh-h1)",
      fontWeight: "var(--fw-semibold)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-display)",
      color: "var(--neutral-0)",
      maxWidth: "22ch",
      textWrap: "pretty"
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: "var(--lh-body-lg)",
      color: "var(--neutral-100)",
      maxWidth: "58ch",
      textWrap: "pretty"
    }
  }, body), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3)",
      marginTop: "var(--space-2)"
    }
  }, actions)));
}
Object.assign(__ds_scope, { PageHero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PageHero.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionHeading({
  level = 2,
  caps = false,
  align = "left",
  title,
  description,
  eyebrow,
  ...rest
}) {
  const Tag = `h${level}`;
  const sizes = {
    1: ["var(--fs-h1)", "var(--lh-h1)"],
    2: ["var(--fs-h2)", "var(--lh-h2)"],
    3: ["var(--fs-h3)", "var(--lh-h3)"],
    4: ["var(--fs-h4)", "var(--lh-h4)"]
  }[level] || ["var(--fs-h2)", "var(--lh-h2)"];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      maxWidth: align === "center" ? "760px" : "none",
      margin: align === "center" ? "0 auto" : 0
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-3)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement(Tag, {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: sizes[0],
      lineHeight: sizes[1],
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)",
      textTransform: caps ? "uppercase" : "none",
      letterSpacing: caps ? "var(--ls-display)" : "var(--ls-body)",
      textWrap: "pretty"
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-4) 0 0",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: "var(--lh-body-lg)",
      color: "var(--text-secondary)",
      maxWidth: "68ch",
      textWrap: "pretty"
    }
  }, description));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/content/Tile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const AR = {
  large: "1258 / 629",
  medium: "528 / 534",
  small: "528 / 320"
};
function Tile({
  size = "medium",
  image,
  imageAlt = "",
  title,
  href = "#",
  eyebrow,
  cta = "Learn more",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      textDecoration: "none",
      color: "inherit"
    },
    onMouseEnter: e => {
      const i = e.currentTarget.querySelector("img");
      if (i) i.style.transform = "var(--image-hover-zoom)";
    },
    onMouseLeave: e => {
      const i = e.currentTarget.querySelector("img");
      if (i) i.style.transform = "none";
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: AR[size] || AR.medium,
      overflow: "hidden",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      transition: "transform var(--dur-slow) var(--ease-standard)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, eyebrow, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: size === "large" ? "var(--fs-h3)" : "var(--fs-h4)",
      lineHeight: size === "large" ? "var(--lh-h3)" : "var(--lh-h4)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)",
      textWrap: "pretty"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-core)",
      fontSize: "15px",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-caps-cta)",
      textTransform: "uppercase",
      color: "var(--text-primary)"
    }
  }, cta)));
}
Object.assign(__ds_scope, { Tile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Tile.jsx", error: String((e && e.message) || e) }); }

// components/disclosure/Accordion.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CHEVRON = "https://assets.xboxservices.com/assets/96/3b/963b4c40-5f82-4fa6-9869-ae7de34a91af.svg?n=Charlie_Accordion_OpenButton.svg";
function Accordion({
  items = [],
  openId,
  onToggle,
  ...rest
}) {
  const [internal, setInternal] = React.useState(null);
  const current = openId !== undefined ? openId : internal;
  const toggle = id => {
    if (onToggle) onToggle(id === current ? null : id);else setInternal(id === current ? null : id);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, rest), items.map(it => {
    const on = current === it.id;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => toggle(it.id),
      "aria-expanded": on,
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        padding: "var(--space-5) 0",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "var(--font-core)",
        fontSize: "var(--fs-h5)",
        lineHeight: "var(--lh-h5)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--text-primary)"
      }
    }, /*#__PURE__*/React.createElement("span", null, it.title), /*#__PURE__*/React.createElement("img", {
      src: CHEVRON,
      alt: "",
      width: "20",
      height: "20",
      style: {
        flex: "0 0 auto",
        transform: on ? "rotate(180deg)" : "none",
        transition: "transform var(--dur-fast) var(--ease-standard)"
      }
    })), on && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 0 var(--space-5)",
        fontFamily: "var(--font-core)",
        fontSize: "var(--fs-body)",
        lineHeight: "var(--lh-body)",
        color: "var(--text-secondary)",
        maxWidth: "72ch"
      }
    }, it.content));
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/disclosure/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/disclosure/Carousel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LEFT = "https://assets.xboxservices.com/assets/ce/11/ce11f6ec-387e-4cc4-8c9f-b54cd07cb484.png?n=leftArrow.png";
const RIGHT = "https://assets.xboxservices.com/assets/d6/e3/d6e36946-1187-42e4-9037-5a4374778483.png?n=rightArrow.png";
function Carousel({
  children,
  perView = 3,
  gap = "var(--space-4)",
  label = "Carousel",
  ...rest
}) {
  const slides = React.Children.toArray(children);
  const [start, setStart] = React.useState(0);
  const max = Math.max(0, slides.length - perView);
  const go = d => setStart(s => Math.min(max, Math.max(0, s + d)));
  const arrow = (dir, disabled) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => go(dir === "left" ? -1 : 1),
    disabled: disabled,
    "aria-label": dir === "left" ? "Previous" : "Next",
    style: {
      width: "44px",
      height: "44px",
      flex: "0 0 auto",
      display: "grid",
      placeItems: "center",
      background: "transparent",
      border: "1px solid var(--border-subtle)",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? .3 : 1,
      transition: "background var(--dur-fast) var(--ease-standard)"
    },
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.background = "var(--white-a12)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "transparent";
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: dir === "left" ? LEFT : RIGHT,
    alt: "",
    width: "16",
    height: "16"
  }));
  return /*#__PURE__*/React.createElement("section", _extends({
    "aria-roledescription": "carousel",
    "aria-label": label,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, rest), arrow("left", start === 0), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap,
      transform: `translateX(calc(-${start} * (100% + ${gap}) / ${perView}))`,
      transition: "transform var(--dur-slow) var(--ease-standard)"
    }
  }, slides.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: `0 0 calc((100% - (${perView} - 1) * ${gap}) / ${perView})`,
      minWidth: 0
    }
  }, s)))), arrow("right", start >= max));
}
Object.assign(__ds_scope, { Carousel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/disclosure/Carousel.jsx", error: String((e && e.message) || e) }); }

// components/disclosure/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CLOSE = "https://assets.xboxservices.com/assets/9b/7b/9b7bdeb0-0cf2-46f6-a4ff-be0fceffdee9.svg?n=Games-Catalog_Image-0_X-Button_230x120.svg";
function Tooltip({
  label,
  children,
  defaultOpen = false,
  ...rest
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    "aria-expanded": open,
    "aria-label": `More about ${label}`,
    style: {
      width: "18px",
      height: "18px",
      flex: "0 0 auto",
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-round)",
      border: "1px solid var(--border-strong)",
      background: "transparent",
      color: "var(--text-secondary)",
      fontSize: "11px",
      fontFamily: "var(--font-core)",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "i"), open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      zIndex: 20,
      width: "280px",
      padding: "var(--space-4)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-flyout)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: "var(--lh-body-sm)",
      color: "var(--text-secondary)",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(false),
    "aria-label": "Close",
    style: {
      float: "right",
      marginLeft: "var(--space-3)",
      padding: 0,
      background: "transparent",
      border: "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: CLOSE,
    alt: "",
    width: "14",
    height: "14"
  })), children));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/disclosure/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/shell/GlobalNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const XBOX_LOGO = "https://uhf.microsoft.com/images/xbox/RW4ESm.png";
const MS_LOGO = "https://uhf.microsoft.com/images/microsoft/RE1Mu3b.png";
function GlobalNav({
  links = [],
  active,
  onNavigate,
  showMicrosoftBar = true,
  actions,
  sticky = true,
  ...rest
}) {
  const item = (label, on) => ({
    display: "flex",
    alignItems: "center",
    height: "100%",
    padding: "0 var(--space-4)",
    fontFamily: "var(--font-core)",
    fontSize: "var(--fs-body)",
    lineHeight: "var(--lh-body)",
    color: "var(--text-primary)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    boxShadow: on ? "inset 0 -3px 0 var(--green-600)" : "none",
    transition: "background var(--dur-fast) var(--ease-standard)"
  });
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      position: sticky ? "sticky" : "static",
      top: 0,
      zIndex: 40,
      background: "var(--surface-nav)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, rest), showMicrosoftBar && /*#__PURE__*/React.createElement("div", {
    style: {
      height: "var(--nav-height)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "0 var(--space-6)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://www.microsoft.com",
    "aria-label": "Microsoft",
    style: {
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: MS_LOGO,
    alt: "Microsoft",
    height: "20",
    style: {
      height: "20px",
      width: "auto",
      display: "block"
    }
  }))), /*#__PURE__*/React.createElement("nav", {
    style: {
      height: "var(--shellnav-height)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      padding: "0 var(--space-6)",
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    "aria-label": "XBOX home",
    style: {
      display: "flex",
      alignItems: "center",
      paddingRight: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: XBOX_LOGO,
    alt: "Xbox",
    height: "22",
    style: {
      height: "22px",
      width: "auto",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "stretch",
      height: "100%",
      flex: 1,
      minWidth: 0,
      overflow: "hidden"
    }
  }, links.map(l => {
    const label = typeof l === "string" ? l : l.label;
    return /*#__PURE__*/React.createElement("a", {
      key: label,
      href: typeof l !== "string" && l.href || "#",
      style: item(label, active === label),
      onClick: e => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(label);
        }
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "var(--white-a08)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "transparent";
      }
    }, label);
  })), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, actions)));
}
Object.assign(__ds_scope, { GlobalNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/GlobalNav.jsx", error: String((e && e.message) || e) }); }

// components/shell/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Xbox publishes no icon font. Each glyph is an individually authored file on the CDN;
   these are the real URLs, read from live page source. */
const XBOX_ICONS = {
  mail: "https://assets.xboxservices.com/assets/f8/67/f86740d7-eedd-4d9c-a963-76af7e36c4b2.svg?n=Xbox-Follow-Footer_Image-0_Mail_32x32_02.svg",
  facebook: "https://assets.xboxservices.com/assets/45/e3/45e3942b-7e08-4f7a-9e78-7b073d07118f.svg?n=Xbox-Follow-Footer_Image-0_Facebook_32x32_02.svg",
  x: "https://assets.xboxservices.com/assets/c9/71/c971845d-5e9d-4f26-8426-b71b9910b183.svg?n=Xbox-Follow-Footer_Image-0_X_32x32_02.svg",
  instagram: "https://assets.xboxservices.com/assets/21/a4/21a47e36-c00c-4fb0-bd18-bc72cfc41e5d.svg?n=Xbox-Follow-Footer_Image-0_Instagram_32x32_02.svg",
  whatsapp: "https://assets.xboxservices.com/assets/94/ca/94ca9c9a-22cf-4d0f-b76d-60cefb1f76b4.svg?n=Xbox-Follow-Footer_Image-0_Whatsapp_32x32_02.svg",
  tiktok: "https://assets.xboxservices.com/assets/e9/38/e9389fa4-7e2f-4f25-860d-3ada8618dbda.svg?n=Xbox-Follow-Footer_Image-0_TikTok_32x32_02.svg",
  youtube: "https://assets.xboxservices.com/assets/48/8d/488d5ad9-d9fa-48dc-a0c8-020a35333edb.svg?n=Xbox-Follow-Footer_Image-0_YouTube_32x32_01.svg",
  linkedin: "https://cms-assets.xboxservices.com/assets/67/27/67276182-bc71-4ac8-b4d4-17eaa2d6950e.svg?n=MWF-Xbox-Template-2025_LinkedIn-Dark.svg",
  accordion: "https://assets.xboxservices.com/assets/96/3b/963b4c40-5f82-4fa6-9869-ae7de34a91af.svg?n=Charlie_Accordion_OpenButton.svg",
  arrowLeft: "https://assets.xboxservices.com/assets/ce/11/ce11f6ec-387e-4cc4-8c9f-b54cd07cb484.png?n=leftArrow.png",
  arrowRight: "https://assets.xboxservices.com/assets/d6/e3/d6e36946-1187-42e4-9037-5a4374778483.png?n=rightArrow.png",
  close: "https://assets.xboxservices.com/assets/9b/7b/9b7bdeb0-0cf2-46f6-a4ff-be0fceffdee9.svg?n=Games-Catalog_Image-0_X-Button_230x120.svg",
  compare: "https://cms-assets.xboxservices.com/assets/04/4c/044ccec2-2f48-4617-8134-2d6ed7158787.svg?n=Game-Pass_SKU-Chart-0_Compare_130x88.svg",
  gift: "https://cms-assets.xboxservices.com/assets/b6/c4/b6c42196-084e-4111-ad36-483d2707da90.svg?n=Game-Pass_SKU-Chart-0_Gift_130x88.svg",
  renew: "https://cms-assets.xboxservices.com/assets/97/81/9781bc02-5a8b-4144-90a3-eed8da788baf.svg?n=Game-Pass_SKU-Chart-0_Renew_130x88.svg",
  g4eBadge: "https://assets.xboxservices.com/assets/1f/6e/1f6e5620-7980-4def-bad3-5738ad1362af.svg?n=G4E-Hub_Badge-Thumbnail_130x150.svg"
};
function Icon({
  name,
  src,
  size = 24,
  alt = "",
  ...rest
}) {
  const url = src || XBOX_ICONS[name];
  if (!url) return null;
  return /*#__PURE__*/React.createElement("img", _extends({
    src: url,
    alt: alt,
    "aria-hidden": alt ? undefined : "true",
    style: {
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      flex: "0 0 auto"
    }
  }, rest));
}
Object.assign(__ds_scope, { XBOX_ICONS, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/Icon.jsx", error: String((e && e.message) || e) }); }

// components/shell/SiteFooter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DEFAULT_SOCIAL = [{
  name: "mail",
  label: "Email",
  href: "https://account.xbox.com/ContactPreferences"
}, {
  name: "facebook",
  label: "Facebook",
  href: "https://www.facebook.com/xbox"
}, {
  name: "x",
  label: "X",
  href: "https://twitter.com/xbox"
}, {
  name: "instagram",
  label: "Instagram",
  href: "https://www.instagram.com/xbox/"
}, {
  name: "whatsapp",
  label: "WhatsApp",
  href: "https://www.whatsapp.com/channel/0029Va4J1hI5a248Y7hu6A2Y"
}, {
  name: "tiktok",
  label: "TikTok",
  href: "https://www.tiktok.com/@xbox"
}, {
  name: "youtube",
  label: "YouTube",
  href: "https://www.youtube.com/user/xbox"
}, {
  name: "linkedin",
  label: "LinkedIn",
  href: "https://www.linkedin.com/showcase/xbox/"
}];
const DEFAULT_LINKS = ["XBOX consoles", "XBOX games", "XBOX Game Pass", "XBOX accessories", "XBOX Support", "Feedback", "Community Standards", "Photosensitive Seizure Warning", "Microsoft account", "Returns", "Orders tracking"];
const LEGAL = ["Consumer Health Privacy", "Contact Microsoft", "Privacy & Cookies", "Manage cookies", "Terms of use", "Trademarks", "Third Party Notices", "About our ads"];
function SiteFooter({
  followLabel = "Follow XBOX",
  social = DEFAULT_SOCIAL,
  links = DEFAULT_LINKS,
  locale = "English (Canada)",
  legal = LEGAL,
  ...rest
}) {
  const linkStyle = {
    fontFamily: "var(--font-core)",
    fontSize: "var(--fs-body-sm)",
    lineHeight: "var(--lh-body-sm)",
    color: "var(--text-secondary)",
    textDecoration: "none"
  };
  return /*#__PURE__*/React.createElement("footer", _extends({
    style: {
      background: "var(--surface-footer)",
      borderTop: "1px solid var(--border-subtle)",
      padding: "var(--space-12) var(--space-6)"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-core)",
      fontSize: "var(--fs-body)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, followLabel), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, social.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.name
  }, /*#__PURE__*/React.createElement("a", {
    href: s.href,
    "aria-label": s.label,
    style: {
      display: "block",
      opacity: .85,
      transition: "opacity var(--dur-fast) var(--ease-standard)"
    },
    onMouseEnter: e => {
      e.currentTarget.style.opacity = 1;
    },
    onMouseLeave: e => {
      e.currentTarget.style.opacity = .85;
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.name,
    size: 24
  })))))), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3) var(--space-6)",
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: linkStyle,
    onMouseEnter: e => {
      e.currentTarget.style.textDecoration = "underline";
    },
    onMouseLeave: e => {
      e.currentTarget.style.textDecoration = "none";
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3) var(--space-6)",
      alignItems: "center",
      paddingTop: "var(--space-6)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      ...linkStyle,
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\uD83C\uDF10"), locale), legal.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      ...linkStyle,
      fontSize: "11px"
    }
  }, l)), /*#__PURE__*/React.createElement("span", {
    style: {
      ...linkStyle,
      fontSize: "11px",
      marginLeft: "auto"
    }
  }, "\xA9 Microsoft ", new Date().getFullYear()))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/catalog/AccessoriesCatalog.jsx
try { (() => {
const {
  SearchField,
  FilterGroup,
  SortSelect,
  CategoryList,
  EmptyState,
  ProductCard,
  LoadMore,
  Button,
  TextLink,
  SectionHeading,
  Tooltip,
  ContentPlacement,
  GLYPH,
  IMAGE
} = window.XBOXDesignSystem_32ef99;
const D = window.CatalogData;
const EMPTY_IMG = {
  sot: IMAGE.empty404SoT,
  grounded: IMAGE.empty404Grounded,
  minecraft: IMAGE.empty404Minecraft,
  wasteland: IMAGE.empty404Wasteland,
  ori: IMAGE.empty404Ori
};
function AccessoriesCatalog() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState(null);
  const [sel, setSel] = React.useState([]);
  const [sort, setSort] = React.useState("Featured");
  const [shown, setShown] = React.useState(8);
  const [empty] = React.useState(() => D.EMPTY_STATES[Math.floor(Math.random() * D.EMPTY_STATES.length)]);
  const toggle = v => {
    setSel(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]);
    setShown(8);
  };
  const clear = () => {
    setSel([]);
    setCat(null);
    setQ("");
    setShown(8);
  };
  const results = React.useMemo(() => {
    const facetVals = D.FACETS.reduce((m, f) => {
      m[f.title] = f.options;
      return m;
    }, {});
    let out = D.PRODUCTS.filter(p => {
      if (cat && p.category !== cat) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      const works = sel.filter(s => facetVals["Works on"].includes(s));
      const colors = sel.filter(s => facetVals["Color"].includes(s));
      const feats = sel.filter(s => facetVals["Features"].includes(s));
      if (works.length && !works.some(w => p.works.includes(w))) return false;
      if (colors.length && !colors.some(c => p.colors.includes(c))) return false;
      if (feats.length && !feats.some(f => p.features.includes(f))) return false;
      return true;
    });
    const price = p => parseFloat(D.PRICES[p.id][0].replace(/[^0-9.]/g, ""));
    if (sort === "Product name: A-Z") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Product name: Z-A") out = [...out].sort((a, b) => b.title.localeCompare(a.title));
    if (sort === "Price: Low-high") out = [...out].sort((a, b) => price(a) - price(b));
    if (sort === "Price: High-low") out = [...out].sort((a, b) => price(b) - price(a));
    if (sort === "Newest") out = [...out].reverse();
    return out;
  }, [q, cat, sel, sort]);
  const visible = results.slice(0, shown);
  return /*#__PURE__*/React.createElement("main", {
    id: "PageContent",
    "data-theme": "light",
    style: {
      background: "var(--surface-page)",
      color: "var(--text-primary)",
      minHeight: "100vh",
      paddingBottom: "var(--space-24)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      paddingTop: "var(--space-16)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    caps: true,
    level: 1,
    title: "Accessories",
    description: "Make your gaming experience more immersive with XBOX accessories and controllers for XBOX Series X|S and XBOX One consoles, Windows, and mobile gaming."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "260px minmax(0,1fr)",
      gap: "var(--space-12)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      position: "sticky",
      top: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(SearchField, {
    label: "Search accessories",
    value: q,
    onChange: v => {
      setQ(v);
      setShown(8);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)"
    }
  }, "(", sel.length, ") Filters applied"), (sel.length > 0 || cat || q) && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: clear
  }, "Clear filters")), /*#__PURE__*/React.createElement(CategoryList, {
    title: "Categories",
    items: D.CATEGORIES,
    active: cat,
    onSelect: c => {
      setCat(c === cat ? null : c);
      setShown(8);
    }
  }), D.FACETS.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.title,
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(FilterGroup, {
    title: f.title,
    options: f.options,
    selected: sel,
    onToggle: toggle
  }), f.title === "Features" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body)",
      color: "var(--text-secondary)"
    }
  }, "XBOX Wireless Connectivity"), /*#__PURE__*/React.createElement(Tooltip, {
    label: "XBOX Wireless Connectivity"
  }, "XBOX Wireless is a Microsoft proprietary technology that allows gamers to connect accessories to their XBOX consoles wirelessly \u2013 without the need for a USB transmitter or dongle."))))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      flexWrap: "wrap",
      borderBottom: "1px solid var(--border-subtle)",
      paddingBottom: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-h4)",
      lineHeight: "var(--lh-h4)",
      fontWeight: "var(--fw-semibold)"
    }
  }, cat || "Accessories", " (", results.length, ")"), /*#__PURE__*/React.createElement(SortSelect, {
    value: sort,
    onChange: setSort,
    options: D.SORTS
  })), cat && D.CATEGORY_BLURBS[cat] && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      maxWidth: "80ch"
    }
  }, D.CATEGORY_BLURBS[cat]), results.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    image: EMPTY_IMG[empty.key],
    imageAlt: empty.alt,
    headline: empty.headline,
    onAction: clear
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
      gap: "var(--space-8) var(--space-6)"
    }
  }, visible.map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.id,
    image: GLYPH.skeleton,
    imageAlt: "",
    title: p.title,
    subtitle: p.works.slice(0, 3).join(", "),
    price: D.PRICES[p.id][0],
    previousPrice: D.PRICES[p.id][1],
    discount: D.PRICES[p.id][1] ? "11% off" : undefined
  }))), /*#__PURE__*/React.createElement(LoadMore, {
    canLoadMore: shown < results.length,
    canLoadFewer: shown > 8,
    onLoadMore: () => setShown(s => s + 8),
    onLoadFewer: () => setShown(8)
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-caption)",
      lineHeight: "var(--lh-caption)",
      fontStyle: "italic",
      color: "var(--text-legal)",
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-4)"
    }
  }, "Product photography is intentionally left as the site\u2019s own skeleton placeholder asset (", /*#__PURE__*/React.createElement("code", null, "Skeleton_960x540.gif"), "). The fetched catalog page rendered its product grid client-side, so no real product-shot URLs were available to reference. Prices are illustrative for the same reason."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      gap: "var(--space-8)",
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement(ContentPlacement, {
    layout: "row",
    image: IMAGE.tileSmallTransparency,
    imageAlt: "A gamer playing Halo Infinite directly on their television.",
    title: "Stream XBOX games. No console required.",
    body: "Use any of these accessories while you stream hundreds of high-quality games directly on select Samsung 2020 and newer smart TVs.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Learn more")
  }), /*#__PURE__*/React.createElement(ContentPlacement, {
    layout: "row",
    image: IMAGE.sliderCloud,
    imageAlt: "Two people playing XBOX games on cloud enabled devices.",
    title: "Discover more ways to play",
    body: "These accessories can be used with XBOX Cloud Gaming. Cloud gaming is available on supported PCs, consoles, mobile phones, tablets, select Samsung smart TVs, and select Meta Quest VR headsets.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Learn more")
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)"
    }
  }, "Back to top")));
}
Object.assign(window, {
  AccessoriesCatalog
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/catalog/AccessoriesCatalog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/catalog/catalogData.js
try { (() => {
/* Category taxonomy, facets, sort options and category blurbs are verbatim from
   https://www.xbox.com/en-ca/accessories. Product NAMES are drawn from products the
   site names in its own copy; product PHOTOGRAPHY URLs were not present in the fetched
   source, so cards fall back to the site's own skeleton placeholder asset. */
const CATEGORIES = ["Controllers", "XBOX Design Lab", "Console wraps", "Mobile gaming accessories", "Stands and charging solutions", "Headsets & communication", "Storage", "Display", "Cables & networking", "Wheels & joysticks", "Assistive technologies", "Handhelds", "Components"];
const CATEGORY_BLURBS = {
  "Controllers": "Elevate your game with the modernized design of the XBOX Wireless Controller, play like a pro with the XBOX Elite Wireless Controller Series 2, or jump in with any of these stylish peripherals.",
  "XBOX Design Lab": "Customize the XBOX Wireless Controller or XBOX Elite Wireless Controller \u2013 Series 2 with XBOX Design Lab. With billions of combinations of top cases, thumbsticks, d-pads, and more, you can truly make it yours.",
  "Console wraps": "Constructed with solid panels and engineered fabric in various designs, XBOX Series X Console Wraps easily add a bold look to your console. Each wrap is fastened by a Velcro enclosure, so no tools or adhesives are required.",
  "Mobile gaming accessories": "Enhance your portable gaming experience with these ergonomic gaming accessories. Play your favorite games on your go-to compatible devices with these controllers and accessories designed for gaming on the go.",
  "Stands and charging solutions": "Keep your game going longer and your XBOX controllers powered up with these compatible stands and charging solutions. Accessible storage and ample play time, all in one.",
  "Headsets & communication": "When it comes to creating an immersive gaming experience, these XBOX-compatible headsets are all sound options. Take in the best-in-class audio of the XBOX Wireless Headset, or play loud and clear with the wired XBOX Stereo Headset.",
  "Storage": "These storage solutions for your XBOX Series X and XBOX Series S provide even more space to save your games, highlight clips, and other media files.",
  "Display": "Searching for innovative and unconventional options to view your favorite XBOX games or streaming content? Consider one of these premium compatible projectors or displays.",
  "Cables & networking": "Keep your console connected with these essential cables for use with the XBOX Series X and XBOX Series S.",
  "Wheels & joysticks": "It\u2019s your turn to take the lead with these wheels and joysticks for XBOX Series X and XBOX Series S. Prepare to take flight, tear up the track, and trounce the competition.",
  "Assistive technologies": "Game your way with these controllers and devices designed to meet the accessibility needs of gamers with limited mobility. Adaptive controllers, compatible switches, foot pedals, and more.",
  "Handhelds": "Enhance your handheld gaming experience. Play your favorite games with accessories designed specifically for portable gaming on your go-to handheld gaming devices.",
  "Components": "Refine your precision with additional components for your setup. Controller covers and thumbstick grips help protect your peripherals game after game."
};
const FACETS = [{
  title: "Works on",
  options: ["XBOX Series X|S", "XBOX One", "PC", "iPhone", "Android", "TV", "Cloud"]
}, {
  title: "Price",
  options: ["Less than $25", "$25-49.99", "$50-100.00", "$100+"]
}, {
  title: "Features",
  options: ["3.5 mm headphone jack", "Bluetooth", "Customizable", "Inspired by games", "Interchangeable components", "Rechargeable", "Wired", "Wireless"]
}, {
  title: "Color",
  options: ["Black", "Blue", "Green", "Pink", "Purple", "Red", "White", "Yellow"]
}];
const SORTS = ["Featured", "Newest", "Product name: A-Z", "Product name: Z-A", "Price: High-low", "Price: Low-high", "Percentage off"];

/* Names and categories are from the site's own copy. Prices are illustrative — the
   fetched page rendered its price grid client-side and returned no values. */
const PRODUCTS = [{
  id: 1,
  title: "XBOX Wireless Controller \u2013 Carbon Black",
  category: "Controllers",
  works: ["XBOX Series X|S", "XBOX One", "PC", "Android", "iPhone"],
  colors: ["Black"],
  features: ["Wireless", "Bluetooth", "3.5 mm headphone jack"]
}, {
  id: 2,
  title: "XBOX Wireless Controller \u2013 Robot White",
  category: "Controllers",
  works: ["XBOX Series X|S", "XBOX One", "PC", "Android"],
  colors: ["White"],
  features: ["Wireless", "Bluetooth"]
}, {
  id: 3,
  title: "XBOX Elite Wireless Controller Series 2",
  category: "Controllers",
  works: ["XBOX Series X|S", "XBOX One", "PC"],
  colors: ["Black"],
  features: ["Wireless", "Rechargeable", "Customizable", "Interchangeable components"]
}, {
  id: 4,
  title: "XBOX Elite Series 2 \u2013 Component Pack",
  category: "Components",
  works: ["XBOX Series X|S", "XBOX One", "PC"],
  colors: ["Black"],
  features: ["Interchangeable components", "Customizable"]
}, {
  id: 5,
  title: "XBOX Design Lab \u2013 Wireless Controller",
  category: "XBOX Design Lab",
  works: ["XBOX Series X|S", "XBOX One", "PC"],
  colors: ["Green", "Blue", "Red", "Pink"],
  features: ["Customizable", "Wireless"]
}, {
  id: 6,
  title: "XBOX Series X Console Wrap",
  category: "Console wraps",
  works: ["XBOX Series X|S"],
  colors: ["Black", "Blue"],
  features: ["Inspired by games"]
}, {
  id: 7,
  title: "XBOX Wireless Headset",
  category: "Headsets & communication",
  works: ["XBOX Series X|S", "XBOX One", "PC", "Android"],
  colors: ["Black"],
  features: ["Wireless", "Rechargeable", "Bluetooth"]
}, {
  id: 8,
  title: "XBOX Stereo Headset",
  category: "Headsets & communication",
  works: ["XBOX Series X|S", "XBOX One", "PC"],
  colors: ["Black"],
  features: ["Wired", "3.5 mm headphone jack"]
}, {
  id: 9,
  title: "Storage Expansion Card for XBOX Series X|S \u2013 1TB",
  category: "Storage",
  works: ["XBOX Series X|S"],
  colors: ["Black"],
  features: []
}, {
  id: 10,
  title: "XBOX Adaptive Controller",
  category: "Assistive technologies",
  works: ["XBOX Series X|S", "XBOX One", "PC"],
  colors: ["White"],
  features: ["Customizable", "Wired"]
}, {
  id: 11,
  title: "XBOX Adaptive Joystick",
  category: "Assistive technologies",
  works: ["XBOX Series X|S", "PC"],
  colors: ["White"],
  features: ["Customizable", "Wired"]
}, {
  id: 12,
  title: "XBOX Rechargeable Battery + USB-C Cable",
  category: "Stands and charging solutions",
  works: ["XBOX Series X|S", "XBOX One"],
  colors: ["Black"],
  features: ["Rechargeable"]
}, {
  id: 13,
  title: "ROG XBOX Ally Travel Case",
  category: "Handhelds",
  works: ["PC"],
  colors: ["Black"],
  features: []
}, {
  id: 14,
  title: "XBOX Wireless Adapter for Windows 10",
  category: "Cables & networking",
  works: ["PC"],
  colors: ["Black"],
  features: ["Wireless"]
}, {
  id: 15,
  title: "Mobile Gaming Clip for XBOX Controllers",
  category: "Mobile gaming accessories",
  works: ["Android", "iPhone", "Cloud"],
  colors: ["Black"],
  features: []
}, {
  id: 16,
  title: "Racing Wheel for XBOX Series X|S",
  category: "Wheels & joysticks",
  works: ["XBOX Series X|S", "PC"],
  colors: ["Black"],
  features: ["Wired"]
}];
const PRICES = {
  1: ["$74.99"],
  2: ["$74.99"],
  3: ["$249.99", "$279.99"],
  4: ["$79.99"],
  5: ["$109.99"],
  6: ["$74.99"],
  7: ["$139.99", "$159.99"],
  8: ["$34.99"],
  9: ["$279.99"],
  10: ["$129.99"],
  11: ["$39.99"],
  12: ["$34.99"],
  13: ["$59.99"],
  14: ["$34.99"],
  15: ["$24.99"],
  16: ["$479.99"]
};
const EMPTY_STATES = [{
  key: "sot",
  headline: "Double check your map, Captain",
  alt: "Sea of Thieves, a sailor at the helm of a ship."
}, {
  key: "grounded",
  headline: "You\u2019re headed for the wrong backyard!",
  alt: "Grounded, characters running towards the viewer with weapons drawn."
}, {
  key: "minecraft",
  headline: "Let your torch guide you down another path",
  alt: "Minecraft Dungeons, an armored adventuring party walks across a bridge."
}, {
  key: "wasteland",
  headline: "This trail may be a little too cold",
  alt: "Wasteland 3, a battle occurring in heavy snow."
}, {
  key: "ori",
  headline: "Destiny lies another way",
  alt: "Ori and the Will of the Wisps, a glowing tree in a dark forest."
}];
Object.assign(__ds_scope, { CATEGORIES, CATEGORY_BLURBS, FACETS, SORTS, PRODUCTS, PRICES, EMPTY_STATES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/catalog/catalogData.js", error: String((e && e.message) || e) }); }

// ui_kits/game-pass/GamePassPage.jsx
try { (() => {
const {
  PageHero,
  SectionHeading,
  ContentPlacement,
  Carousel,
  Accordion,
  Eyebrow,
  Button,
  TextLink,
  Footnote,
  IMAGE
} = window.XBOXDesignSystem_32ef99;
const VALUE_PROPS = [["Play hundreds of games", "Access a growing library of console and PC games with new games added each month."], ["Play on your devices", "Play on XBOX console, PC, and more devices with cloud gaming."], ["Enjoy benefits & rewards", "Get in-game benefits, online console multiplayer, exclusive discounts, and more rewards."]];
const BENEFITS = [{
  plans: ["Ultimate"],
  title: "Fortnite Crew",
  image: IMAGE.sliderFortnite,
  alt: "Three Fortnite characters standing in front of a concert stage.",
  body: "Get access to the current Battle Pass, OG Pass, LEGO Pass, Music Pass and Rocket Pass Premium. In addition, get V-Bucks each month.",
  cta: "Play Fortnite"
}, {
  plans: ["Ultimate", "PC"],
  title: "Experience the world of EA",
  image: IMAGE.sliderEaPlay,
  alt: "A collection of games published by EA, including EA SPORTS FC 26 and Madden NFL 26.",
  body: "Jump into best-loved titles like EA SPORTS FC, The Sims, STAR WARS\u2122 and other fan favourites with EA Play.",
  cta: "Explore EA Play"
}, {
  plans: ["Ultimate"],
  title: "Ubisoft+ Classics",
  image: IMAGE.sliderUbisoft,
  alt: "Ubisoft+ Classics, four panels showing game art.",
  body: "Discover 50+ iconic games from some of the most memorable franchises in gaming history with Ubisoft+ Classics.",
  cta: "Explore Ubisoft+ Classics"
}, {
  plans: ["Ultimate", "Premium", "Essential"],
  title: "Stream and play anywhere",
  image: IMAGE.sliderCloud,
  alt: "Microsoft Flight Simulator gameplay across a laptop, TV, phone and tablet.",
  body: "Skip the download and stream games (including select games you own) on any supported device, including mobile, tablet, TV and VR headset.",
  cta: "Explore cloud gaming"
}, {
  plans: ["All plans"],
  title: "In-game benefits",
  image: IMAGE.sliderBenefits,
  alt: "Game art from League of Legends, Call of Duty: Warzone and Overwatch 2.",
  body: "Get in-game benefits in the biggest games like League of Legends, Call of Duty: Warzone and Rainbow Six Siege.",
  cta: "Explore in-game benefits"
}, {
  plans: ["All plans"],
  title: "Earn more rewards with XBOX Game Pass",
  image: IMAGE.sliderRewards,
  alt: "Illuminated award ribbon icon",
  body: "Earn more rewards with Game Pass when playing or buying games. With Ultimate, you can play and earn up to 100,000 Rewards points a year in the Store with Rewards.",
  cta: "Explore Rewards"
}, {
  plans: ["Ultimate", "Premium", "Essential"],
  title: "Multiplayer games",
  image: IMAGE.sliderMultiplayer,
  alt: "Two people wearing headsets playing XBOX games on a sofa together",
  body: "Join your friends to play, chat and explore together with online console multiplayer.",
  cta: "Browse multiplayer games"
}, {
  plans: ["All plans"],
  title: "Deals and discounts",
  image: IMAGE.sliderDeals,
  alt: "Icon of a discount tag",
  body: "Unlock discounts on games, partner benefits and more.",
  cta: "Explore deals"
}];
const FAQ = [["what", "What is XBOX Game Pass?", "XBOX Game Pass is a subscription that gives you access to a library of console and PC games, with new games added all the time. Game availability varies by plan."], ["market", "Is the XBOX Game Pass available in my market?", "Game titles, number, features and availability vary over time, by region, XBOX Game Pass plan and platform."], ["find", "Where do I find XBOX Game Pass games?", "See the current game library at xbox.com/xbox-game-pass/games, in the Game Pass section of the store on your console, or in the XBOX app on PC."], ["how-long", "How long do I have access to games in the XBOX Game Pass library?", "Game titles, number, features and availability vary over time. Games can leave the library, so check the current library before you start a long playthrough."], ["cancel", "How do I cancel XBOX Game Pass?", "Cancel your subscription in your Microsoft account at account.microsoft.com/services, or on your XBOX console, before the next billing date."], ["billing", "How do I stop recurring billing?", "To stop being charged, cancel your subscription in your Microsoft account or on your XBOX console, before the next billing date."]];
function GamePassPage() {
  return /*#__PURE__*/React.createElement("main", {
    id: "PageContent"
  }, /*#__PURE__*/React.createElement(PageHero, {
    image: IMAGE.devicesWide,
    scrim: "left",
    minHeight: "min(64vh, 620px)",
    imageAlt: "XBOX consoles, wireless controllers, VR headset, laptop, handheld and phone with game art behind them.",
    title: "Join Game Pass",
    body: "Play hundreds of top PC and console games all for one low monthly price. Stream and play anywhere. New games added all the time.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      href: "#join"
    }, "Choose a plan"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      href: "#"
    }, "Browse games"))
  }), /*#__PURE__*/React.createElement("section", {
    className: "section-tight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid3"
  }, VALUE_PROPS.map(([t, b]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-h3)",
      lineHeight: "var(--lh-h3)",
      fontWeight: "var(--fw-semibold)"
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, b)))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-8)",
      fontSize: "var(--fs-body-sm)",
      fontStyle: "italic",
      color: "var(--text-legal)"
    }
  }, "Game availability varies by plan"))), /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      background: "var(--surface-raised)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: 2,
    title: "Play on your devices",
    description: "Download games to your XBOX console, PC, and supported handhelds, or stream on more devices including phone, tablet, TV, and VR headset."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-12)",
      aspectRatio: "3840 / 1440",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMAGE.devicesWide,
    alt: "XBOX consoles, controllers, VR headset, laptop, handheld and phone.",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      marginTop: "var(--space-12)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-h3)",
      lineHeight: "var(--lh-h3)",
      fontWeight: "var(--fw-semibold)",
      maxWidth: "44ch"
    }
  }, "Get the XBOX PC app to discover, download, and play hundreds of games."), /*#__PURE__*/React.createElement(Button, {
    href: "#",
    size: "lg"
  }, "Get the app"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-secondary)"
    }
  }, "Requires Windows 10/11, version 22H2 or higher"))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: 2,
    title: "Enjoy more benefits with XBOX Game Pass"
  }), /*#__PURE__*/React.createElement(Carousel, {
    perView: 3,
    label: "Game Pass benefits"
  }, BENEFITS.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.title,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "832 / 572",
      overflow: "hidden",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: b.image,
    alt: b.alt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement(Eyebrow, {
    items: b.plans
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-h4)",
      lineHeight: "var(--lh-h4)",
      fontWeight: "var(--fw-semibold)"
    }
  }, b.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, b.body), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TextLink, {
    href: "#"
  }, b.cta))))))), /*#__PURE__*/React.createElement(window.PlanChart, null), /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      background: "var(--surface-raised)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      maxWidth: "1000px"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: 2,
    title: "Frequently Asked Questions"
  }), /*#__PURE__*/React.createElement(Accordion, {
    items: FAQ.map(([id, title, content]) => ({
      id,
      title,
      content: /*#__PURE__*/React.createElement("p", null, content)
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-h4)",
      fontWeight: "var(--fw-semibold)"
    }
  }, "See more FAQs"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(TextLink, {
    href: "#"
  }, "XBOX Game Pass FAQ"), /*#__PURE__*/React.createElement(TextLink, {
    href: "#"
  }, "XBOX Cloud Gaming FAQ"))))), /*#__PURE__*/React.createElement("section", {
    className: "section-tight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--space-4)",
      maxWidth: "110ch"
    }
  }, /*#__PURE__*/React.createElement(Footnote, {
    title: "XBOX Subscription Terms:"
  }, "See xbox.com/subscriptionterms."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "1",
    title: "Promotional Offers:"
  }, "Sign in for your available offers. Promotional offers may be for new subscribers only and/or not be valid for all subscribers and are only available for a limited time. Offers available in select regions only. Credit card required. After promotional period, subscription automatically continues at the then-current regular price (subject to change), unless canceled, plus applicable taxes."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "2"
  }, "Select games. Excludes Call of Duty titles."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "3",
    title: "Rewards:"
  }, "Terms apply. Microsoft Account required. Select markets only. Rewards vary by Game Pass plan and Rewards Level. Point values vary by local market currency, Rewards level, and the number of points redeemed. Point multipliers compared to Game Pass Essential earning potential. Gameplay rewards for 18+."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "4",
    title: "XBOX Cloud Gaming:"
  }, "XBOX Cloud Gaming requires an XBOX Game Pass subscription and supported device (both sold separately). Cloud playable games not included with XBOX Game Pass are sold separately. Game library varies. Select regions and devices."), /*#__PURE__*/React.createElement(Footnote, {
    title: "Recurring Billing:"
  }, "By subscribing you are authorizing recurring payments made to Microsoft at the intervals you selected, until cancelled. To stop being charged, cancel your subscription in your Microsoft account or on your XBOX console, before the next billing date.")))));
}
Object.assign(window, {
  GamePassPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game-pass/GamePassPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game-pass/PlanChart.jsx
try { (() => {
const {
  SkuCard,
  SectionHeading,
  TextLink,
  Icon,
  LOGO
} = window.XBOXDesignSystem_32ef99;
const TERMS = /*#__PURE__*/React.createElement(React.Fragment, null, "Subscription continues automatically.", /*#__PURE__*/React.createElement("br", null), "See ", /*#__PURE__*/React.createElement(TextLink, {
  variant: "inline",
  href: "#"
}, "terms"), ".");
const PLANS = [{
  name: "Essential",
  priceLine: "Get your first month for $1, then $XX.XX/month",
  marker: "1",
  library: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "50+ games"), " playable on console, PC, & more devices"),
  features: ["Unlimited cloud gaming", "Benefits for games like League of Legends and Call of Duty: Warzone", "Online console multiplayer", "Earn Rewards points"]
}, {
  name: "Premium",
  priceLine: "Get your first 14 days for $1, then $XX.XX/month",
  marker: "1",
  library: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "200+ games"), " playable on console, PC, & more devices"),
  features: ["New XBOX-published games within 1yr of launch", "Unlimited cloud gaming with shorter wait times", "Benefits for games like League of Legends and Call of Duty: Warzone", "Online console multiplayer", "Earn 2x Rewards points"]
}, {
  name: "Ultimate",
  priceLine: "$XX.XX/month",
  featured: true,
  library: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "400+ games"), " playable on console, PC, & more devices"),
  features: [/*#__PURE__*/React.createElement("strong", null, "New games on day one"), "EA Play, Fortnite Crew, & Ubisoft+ Classics", "Unlimited cloud gaming at our best quality with the shortest wait times", "Benefits for games like League of Legends and Call of Duty: Warzone", "Online console multiplayer", "Earn 4x Rewards points"]
}, {
  name: "PC only",
  priceLine: "$XX.XX/month",
  library: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "300+ games"), " playable on PC only"),
  features: [/*#__PURE__*/React.createElement("strong", null, "New games on day one"), "EA Play", "Benefits for games like League of Legends and Call of Duty: Warzone", "Earn 2x Rewards points"]
}];
const UTILITY = [{
  icon: "compare",
  title: "Still unsure?",
  cta: "Compare all features"
}, {
  icon: "gift",
  title: "Have a code or gift card?",
  cta: "Redeem"
}, {
  icon: "renew",
  title: "Already have a subscription?",
  cta: "Renew now"
}];
function PlanChart() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "join"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO.gamePass,
    alt: "XBOX Game Pass",
    style: {
      height: "34px",
      width: "auto",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement(SectionHeading, {
    align: "center",
    level: 2,
    title: "Choose the plan that's right for you",
    description: "Play the games you want on any screen. Get more value. Earn more rewards."
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid4",
    style: {
      alignItems: "stretch"
    }
  }, PLANS.map(p => /*#__PURE__*/React.createElement(SkuCard, {
    key: p.name,
    name: p.name,
    priceLine: p.priceLine,
    footnoteMarker: p.marker,
    badge: "Play on day one",
    featured: p.featured,
    terms: TERMS,
    libraryLine: p.library,
    features: p.features,
    ctaLabel: "Select",
    ctaHref: "#"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid3",
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-12)"
    }
  }, UTILITY.map(u => /*#__PURE__*/React.createElement("div", {
    key: u.title,
    style: {
      display: "flex",
      gap: "var(--space-5)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: u.icon,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-h4)",
      lineHeight: "var(--lh-h4)",
      fontWeight: "var(--fw-semibold)"
    }
  }, u.title), /*#__PURE__*/React.createElement(TextLink, {
    href: "#"
  }, u.cta)))))));
}
Object.assign(window, {
  PlanChart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game-pass/PlanChart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/CommunityHub.jsx
try { (() => {
const {
  PageHero,
  SectionHeading,
  FeatureCard,
  ContentPlacement,
  Tile,
  Eyebrow,
  Button,
  TextLink,
  Icon,
  IMAGE,
  LOGO
} = window.XBOXDesignSystem_32ef99;
function PledgeBlock() {
  const lines = ["Be inclusive and welcoming to all players", "Promote a safe environment on XBOX that everyone can enjoy", "Celebrate the uniqueness of everyone in the gaming community", "Advocate for responsible and accessible gaming", "Positively represent the XBOX community online", "And, above all else: Make gaming fun for everyone"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "auto minmax(0,1fr)",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO.g4eBadge,
    alt: "",
    width: "104",
    height: "120",
    style: {
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    caps: true,
    level: 2,
    title: "XBOX Community Pledge"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      maxWidth: "72ch"
    }
  }, "Join us in helping to make XBOX a place where everyone has fun. The XBOX Community Pledge calls all players to contribute to creating a positive experience while playing with XBOX. In addition to the XBOX Community Standards, keep these principles in mind during your everyday gaming:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: "var(--space-2)"
    }
  }, lines.map(l => /*#__PURE__*/React.createElement("li", {
    key: l,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--green-400)"
    }
  }, "\u2713"), l))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "#"
  }, "Download the badge"))));
}
function SocialRow() {
  const s = [["instagram", "Instagram"], ["x", "X"], ["youtube", "YouTube"], ["facebook", "Facebook"], ["tiktok", "TikTok"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "center",
    level: 2,
    title: "Join us on social to share and live the pledge"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-8)",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, s.map(([n, l]) => /*#__PURE__*/React.createElement("a", {
    key: n,
    href: "#",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-2)",
      textDecoration: "none",
      color: "var(--text-secondary)",
      fontSize: "13px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n,
    size: 30,
    alt: ""
  }), l))));
}
function CommunityHub() {
  return /*#__PURE__*/React.createElement("main", {
    id: "PageContent"
  }, /*#__PURE__*/React.createElement(PageHero, {
    image: IMAGE.pledgeShare,
    imageAlt: "",
    scrim: "left",
    title: "Welcome to XBOX",
    body: "At XBOX, we believe that gaming is for everyone. We strive to make life more fun for billions of people around the world by creating gaming experiences that everyone can enjoy. Because when everyone plays, we all win.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      href: "#"
    }, "Join our community"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      href: "#"
    }, "Read our standards"))
  }), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: 2,
    title: "We believe that gaming should be:"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid3"
  }, /*#__PURE__*/React.createElement(FeatureCard, {
    image: IMAGE.featureInclusive,
    imageAlt: "A man and woman are smiling as they watch him play a game on his phone in front of a large colorful mural.",
    title: "Inclusive of all",
    body: "Diversity is a strength. We strive to be inclusive by welcoming all people to our community, being open to new ideas, and by celebrating the uniqueness of our fans.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Join our XBOX community")
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    image: IMAGE.featureAccessible,
    imageAlt: "A smiling male gamer using an adaptive controller in a bright room.",
    title: "Accessible to all",
    body: "Nothing should come between you and the games you love. We strive to eliminate barriers, and to empower gamers to customize the way they play.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Learn about accessible gaming")
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    image: IMAGE.featureSafe,
    imageAlt: "A smiling father watching his daughter play a game while another daughter behind them cheers.",
    title: "Safe for all",
    body: "Gaming is a fun part of a balanced life. We strive to create a place where everyone can play responsibly, within the boundaries they set, free from fear and intimidation.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Learn about safety settings"), /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Learn about family safety"))
  })))), /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      background: "var(--surface-raised)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: 2,
    title: "Our philosophy in action"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,minmax(0,1fr))",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "span 2"
    }
  }, /*#__PURE__*/React.createElement(Tile, {
    size: "large",
    image: IMAGE.tileLargeAccessibility,
    imageAlt: "A person with a limb difference using the XBOX Adaptive Joystick",
    eyebrow: /*#__PURE__*/React.createElement(Eyebrow, null, "Accessibility"),
    title: "XBOX unveils four new accessibility offerings"
  })), /*#__PURE__*/React.createElement(Tile, {
    size: "medium",
    image: IMAGE.tileMediumMinecraft,
    imageAlt: "Minecraft students outside a school with balloons",
    title: "Cyber Safe: Good Game teaches digital citizenship skills through online gaming"
  }), /*#__PURE__*/React.createElement(Tile, {
    size: "medium",
    image: IMAGE.tileMediumForza,
    imageAlt: "A blue Corvette and a yellow Cadillac speed down a racetrack",
    title: "From blind driving assists to one touch driving, meet the most accessible Forza Motorsport ever"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "span 2"
    }
  }, /*#__PURE__*/React.createElement(Tile, {
    size: "small",
    image: IMAGE.tileSmallIndigenous,
    imageAlt: "A stylized XBOX logo featuring the XBOX sphere with a green basket weave texture.",
    title: "XBOX: A modern canvas for Indigenous storytelling"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "span 2"
    }
  }, /*#__PURE__*/React.createElement(Tile, {
    size: "small",
    image: IMAGE.tileSmallTransparency,
    imageAlt: "Close-up of someone using an XBOX controller",
    title: "XBOX releases fourth transparency report sharing newest applications of AI in gaming safety"
  }))))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement(PledgeBlock, null))), /*#__PURE__*/React.createElement("section", {
    className: "section-tight",
    style: {
      background: "var(--surface-raised)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement(SocialRow, null))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: 2,
    title: "How you can get involved"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid4"
  }, /*#__PURE__*/React.createElement(ContentPlacement, {
    image: IMAGE.placementStandards,
    imageAlt: "A group of four people on a couch playing XBOX together",
    title: "Keep our community safe and fun",
    body: "Gaming should be fun. Help us keep it that way by following our community standards, treating others with respect and kindness, and reporting bullies.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "View XBOX community standards")
  }), /*#__PURE__*/React.createElement(ContentPlacement, {
    image: IMAGE.placementInsider,
    imageAlt: "XBOX astronaut avatar.",
    title: "Make your voice count",
    body: "On PC, XBOX console, or mobile, you can get early access to new games and features, join playtests with our developer partners, and provide valuable feedback.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Join XBOX Insider Program")
  }), /*#__PURE__*/React.createElement(ContentPlacement, {
    image: IMAGE.placementRewards,
    imageAlt: "A medal icon inside a glowing neon circle",
    title: "Enjoy Rewards with XBOX",
    body: "Get rewards for the games you love to play.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Visit the Rewards hub on XBOX")
  }), /*#__PURE__*/React.createElement(ContentPlacement, {
    image: IMAGE.placementFanFest,
    imageAlt: "FanFest, XBOX Sphere with green gradients",
    title: "Join the ultimate XBOX fan club",
    body: "Become an XBOX FanFest member to connect with other players and enjoy exclusive access to unforgettable events and community benefits.",
    actions: /*#__PURE__*/React.createElement(TextLink, {
      href: "#"
    }, "Become an XBOX FanFest member")
  })))));
}
Object.assign(window, {
  CommunityHub
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/CommunityHub.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ConsolesCompare.jsx
try { (() => {
const {
  SectionHeading,
  ComparisonTable,
  Button,
  Footnote,
  SortSelect
} = window.XBOXDesignSystem_32ef99;
const MODELS = {
  "XBOX Series X": ["1TB Disc Drive Carbon Black", "1TB All-Digital Robot White", "2TB Disc Drive Galaxy Black"],
  "XBOX Series S": ["512GB All-Digital Robot White", "1TB All-Digital Carbon Black", "1TB All-Digital Robot White"]
};
const SPECS = {
  "1TB Disc Drive Carbon Black": {
    color: "Carbon Black",
    storage: "1TB Custom SSD",
    tf: "12",
    res: "Up to 4K at 120FPS",
    disc: true,
    size: "15.1cm x 15.1cm x 30.1cm",
    weight: "9.8lbs"
  },
  "1TB All-Digital Robot White": {
    color: "Robot White",
    storage: "1TB Custom SSD",
    tf: "12",
    res: "Up to 4K at 120FPS",
    disc: false,
    size: "15.1cm x 15.1cm x 30.1cm",
    weight: "9.8lbs"
  },
  "2TB Disc Drive Galaxy Black": {
    color: "Galaxy Black Special Edition",
    storage: "2TB Custom SSD",
    tf: "12",
    res: "Up to 4K at 120FPS",
    disc: true,
    size: "15.1cm x 15.1cm x 30.1cm",
    weight: "9.8lbs"
  },
  "512GB All-Digital Robot White": {
    color: "Robot White",
    storage: "512GB Custom SSD",
    tf: "4",
    res: "Up to 1440p at 120FPS",
    disc: false,
    size: "6.5cm x 15.1cm x 27.5cm",
    weight: "4.25lbs"
  },
  "1TB All-Digital Carbon Black": {
    color: "Carbon Black",
    storage: "1TB Custom SSD",
    tf: "4",
    res: "Up to 1440p at 120FPS",
    disc: false,
    size: "6.5cm x 15.1cm x 27.5cm",
    weight: "4.25lbs"
  }
};
const SHARED = ["Up to 120FPS", "XBOX Velocity Architecture", "Quick Resume", "DirectX Raytracing", "Variable Rate Shading", "Spatial Sound", "Smart Delivery", "Play thousands of games across four generations", "Works with XBOX One gaming accessories", "Access to hundreds of games with XBOX Game Pass"];
function ConsolesCompare() {
  const [a, setA] = React.useState("1TB Disc Drive Carbon Black");
  const [b, setB] = React.useState("512GB All-Digital Robot White");
  const sa = SPECS[a],
    sb = SPECS[b];
  const famA = MODELS["XBOX Series X"].includes(a) ? "XBOX Series X" : "XBOX Series S";
  const famB = MODELS["XBOX Series X"].includes(b) ? "XBOX Series X" : "XBOX Series S";
  return /*#__PURE__*/React.createElement("main", {
    id: "PageContent",
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    caps: true,
    level: 1,
    title: "Compare XBOX consoles",
    description: "Compare XBOX Series X and XBOX Series S consoles side by side\u2014review models, specs, features, and performance to find your best fit."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "28% 1fr 1fr",
      gap: "var(--space-3)",
      alignItems: "end"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "13px",
      color: "var(--text-tertiary)"
    }
  }, "Use these dropdowns to change the content in the column below"), /*#__PURE__*/React.createElement(SortSelect, {
    label: famA,
    value: a,
    onChange: setA,
    options: MODELS[famA]
  }), /*#__PURE__*/React.createElement(SortSelect, {
    label: famB,
    value: b,
    onChange: setB,
    options: MODELS[famB]
  })), /*#__PURE__*/React.createElement(ComparisonTable, {
    columns: [{
      title: famA,
      subtitle: a
    }, {
      title: famB,
      subtitle: b
    }],
    sections: [{
      label: "Color",
      rows: [{
        label: "Finish",
        values: [sa.color, sb.color]
      }]
    }, {
      label: "Storage & expandability",
      rows: [{
        label: "Internal storage",
        values: [sa.storage, sb.storage]
      }, {
        label: "Storage Expansion Card support",
        values: [true, true]
      }, {
        label: "USB 3.1 for external HDD",
        values: [true, true]
      }]
    }, {
      label: "Processor",
      rows: [{
        label: "Teraflops processing power",
        values: [sa.tf, sb.tf]
      }]
    }, {
      label: "Gaming resolution",
      rows: [{
        label: "Target resolution",
        values: [sa.res, sb.res]
      }]
    }, {
      label: "Optical disc drive",
      rows: [{
        label: "4K UHD Blu-ray",
        values: [sa.disc, sb.disc]
      }]
    }, {
      label: "Video",
      rows: [{
        label: "Variable Refresh Rate",
        values: [true, true]
      }, {
        label: "Auto Low-Latency Mode",
        values: [true, true]
      }, {
        label: "Dolby Vision",
        values: [true, true]
      }]
    }, {
      label: "Audio",
      rows: [{
        label: "DTS 5.1",
        values: [true, true]
      }, {
        label: "Dolby Digital 5.1",
        values: [true, true]
      }, {
        label: "Dolby TrueHD with Atmos",
        values: [true, true]
      }, {
        label: "Windows Sonic",
        values: [true, true]
      }]
    }, {
      label: "Ports & connectivity",
      rows: [{
        label: "USB 3.1 Gen 1 ports",
        values: ["3x", "3x"]
      }, {
        label: "HDMI 2.1 out",
        values: [true, true]
      }, {
        label: "802.11ac dual band wireless",
        values: [true, true]
      }, {
        label: "1Gbps Ethernet",
        values: [true, true]
      }]
    }, {
      label: "Size and weight",
      rows: [{
        label: "Dimensions",
        values: [sa.size, sb.size]
      }, {
        label: "Weight",
        values: [sa.weight, sb.weight]
      }]
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    caps: true,
    level: 2,
    title: "Shared features of next gen"
  }), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
      gap: "var(--space-3)"
    }
  }, SHARED.map(s => /*#__PURE__*/React.createElement("li", {
    key: s,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--green-400)"
    }
  }, "\u2713"), s))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "#"
  }, "View more tech specs"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      alignItems: "flex-start",
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    caps: true,
    level: 2,
    title: "Still unsure which console is the right one?"
  }), /*#__PURE__*/React.createElement(Button, {
    href: "#",
    size: "lg"
  }, "Help me choose")), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Footnote, {
    marker: "*"
  }, "Prices and availability may vary by retailer."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "**"
  }, "4K at up to 120FPS: Requires supported content and display. Use on XBOX Series X as content becomes available."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "***"
  }, "Standalone product not included in console bundle."), /*#__PURE__*/React.createElement(Footnote, {
    marker: "\u2020"
  }, "Dolby Vision Games is only available on XBOX Series X|S. Dolby Atmos and Dolby Vision media streaming is available on XBOX One, XBOX One S, XBOX One X and XBOX Series X|S."))));
}
Object.assign(window, {
  ConsolesCompare
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ConsolesCompare.jsx", error: String((e && e.message) || e) }); }

__ds_ns.LOGO = __ds_scope.LOGO;

__ds_ns.SOCIAL = __ds_scope.SOCIAL;

__ds_ns.GLYPH = __ds_scope.GLYPH;

__ds_ns.IMAGE = __ds_scope.IMAGE;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.LoadMore = __ds_scope.LoadMore;

__ds_ns.TextLink = __ds_scope.TextLink;

__ds_ns.CategoryList = __ds_scope.CategoryList;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.FilterGroup = __ds_scope.FilterGroup;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.SortSelect = __ds_scope.SortSelect;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ComparisonTable = __ds_scope.ComparisonTable;

__ds_ns.PriceTag = __ds_scope.PriceTag;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.SkuCard = __ds_scope.SkuCard;

__ds_ns.ContentPlacement = __ds_scope.ContentPlacement;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.FeatureCard = __ds_scope.FeatureCard;

__ds_ns.Footnote = __ds_scope.Footnote;

__ds_ns.FootnoteRef = __ds_scope.FootnoteRef;

__ds_ns.PageHero = __ds_scope.PageHero;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Tile = __ds_scope.Tile;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Carousel = __ds_scope.Carousel;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.GlobalNav = __ds_scope.GlobalNav;

__ds_ns.XBOX_ICONS = __ds_scope.XBOX_ICONS;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.CATEGORIES = __ds_scope.CATEGORIES;

__ds_ns.CATEGORY_BLURBS = __ds_scope.CATEGORY_BLURBS;

__ds_ns.FACETS = __ds_scope.FACETS;

__ds_ns.SORTS = __ds_scope.SORTS;

__ds_ns.PRODUCTS = __ds_scope.PRODUCTS;

__ds_ns.PRICES = __ds_scope.PRICES;

__ds_ns.EMPTY_STATES = __ds_scope.EMPTY_STATES;

})();
