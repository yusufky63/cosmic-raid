import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cosmic-raid.vercel.app';
  
  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    baseBuilder: {
      allowedAddresses: ["0xc0F52851fCAac0cac016432E5e11954632cd2fcB"]
    },
    miniapp: {
      version: "1",
      name: "Cosmic Raid",
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${baseUrl}/api/webhook`,
      subtitle: "Epic Space Combat",
      description: "Defend the galaxy! Battle bosses with progressive ship upgrades.",
      screenshotUrls: [
        `${baseUrl}/og-image.png`
      ],
      primaryCategory: "games",
      tags: ["space", "shooter", "arcade"],
      heroImageUrl: `${baseUrl}/og-image.png`,
      tagline: "Defend the galaxy!",
      ogTitle: "Cosmic Raid - Epic Space Shooter",
      ogDescription: "Epic space shooter with boss battles and ship upgrades!",
      ogImageUrl: `${baseUrl}/og-image.png`,
      requiredCapabilities: [
        "wallet.getEthereumProvider",
        "actions.composeCast"
      ]
    }
  };

  return NextResponse.json(manifest);
}

