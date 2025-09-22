chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.action === "runTests") {
      runTests();
    }
  });
  
  // Safe JSON parser
  async function safeJson(res) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        return { raw: await res.text() };
      }
    } else {
      return { raw: await res.text() };
    }
  }
  
  // Extract ID from raw string if needed
  function extractIdFromRaw(raw, key = "id") {
    try {
      const match = raw.match(new RegExp(`"${key}":(\\d+)`));
      return match ? parseInt(match[1]) : undefined;
    } catch {
      return undefined;
    }
  }
  
  // Extract style_number from raw response
  function extractStyleNumber(raw) {
    try {
      const match = raw.match(/"style_number":"([^"]+)"/);
      return match ? match[1] : undefined;
    } catch {
      return undefined;
    }
  }
  
  async function runTests() {
    let collectionId = "";
    let inquiryId = "";
    let styleNumber = "";
    let accessToken = "";
  
    try {
      const postHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
      };
  
      // 1. Login
      const loginRes = await fetch("https://stg-digital.seamlesssource.com/api/login", {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify({
          email: "artsketchbysachin@gmail.com",
          password: "Supplier123"
        })
      });
      const loginData = await safeJson(loginRes);
      accessToken = loginData?.success?.token;
  
      if (!loginRes.ok || !accessToken) {
        chrome.runtime.sendMessage({ action: "log", data: `Login failed: ${JSON.stringify(loginData)}` });
        return;
      }
      chrome.runtime.sendMessage({ action: "log", data: "Login success" });
  
      postHeaders["Authorization"] = `Bearer ${accessToken}`;
  
      // 2. Create Collection
      const createColRes = await fetch("https://stg-digital.seamlesssource.com/api/collection", {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify({ brand_id: 165742, name: "Test Col" })
      });
      const colData = await safeJson(createColRes);
      collectionId = colData?.collection?.id || extractIdFromRaw(colData?.raw);
      if (!collectionId) {
        chrome.runtime.sendMessage({ action: "log", data: `Failed to get collection ID: ${JSON.stringify(colData)}` });
        return;
      }
      chrome.runtime.sendMessage({ action: "log", data: `Collection created: ${collectionId}` });
  
      // 3. Create Inquiry / Style
      const createStyleRes = await fetch("https://stg-digital.seamlesssource.com/api/inquiry", {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify({
          style_name: "Test style",
          product_type: 3,
          start_date: "2025-09-22",
          end_date: "2025-09-25",
          additional_information: "Text",
          bulk_order_quantity: "1000",
          collection_id: collectionId,
          colour_number: "3",
          currency: "USD",
          delivery_destination: "Afghanistan"
        })
      });
      const styleData = await safeJson(createStyleRes);
      inquiryId = styleData?.data?.id || extractIdFromRaw(styleData?.raw);
      styleNumber = styleData?.data?.style_number || extractStyleNumber(styleData?.raw);
      if (!inquiryId || !styleNumber) {
        chrome.runtime.sendMessage({ action: "log", data: `Failed to get inquiry ID or style number: ${JSON.stringify(styleData)}` });
        return;
      }
      chrome.runtime.sendMessage({ action: "log", data: `Inquiry created: ${inquiryId}` });
  
      // 4. Assign Value Chain
      await fetch(`https://stg-digital.seamlesssource.com/api/inquiries/${inquiryId}/assign_value_chain`, {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify({ value_chain_id: 27 })
      });
      chrome.runtime.sendMessage({ action: "log", data: "Value chain assigned" });
  
      // 5. Save Trace
      await fetch(`https://stg-digital.seamlesssource.com/api/inquiry/${inquiryId}/trace/submit`, {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify({
          productName: "test",
          careInstructions: [1, 2],
          data: [
            {
              id: 7430,
              inquiry_id: inquiryId,
              name: "Design",
              icon: "DesignIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: null,
              factory_id: null,
              geo_images: [],
              order: 1,
              supplier: { id: 181392, uuid: "7f44e120-b1d9-4c0f-add3-bd28b32c86eb", name: "PureLoom", reference_name: "PUREL" },
              supplier_id: 181392,
              used_supplier_as_factory: true,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7431,
              inquiry_id: inquiryId,
              name: "Raw Material",
              icon: "RawMaterialIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: { id: 306, uuid: "03ec3d3b-827d-434a-a389-2cc5a399d7a0", name: "Conceria XYZ" },
              factory_id: 306,
              geo_images: [],
              order: 2,
              supplier: { id: 144824, uuid: "c958aad6-9040-4da3-bde1-062a5eed2922", name: "FT TEXTILE GROUP" },
              supplier_id: 144824,
              used_supplier_as_factory: false,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7432,
              inquiry_id: inquiryId,
              name: "Spinning",
              icon: "SpinningIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: { id: 292, uuid: "e71cba68-c52f-489d-86a4-4f303f4ede9e", name: "Textile Recycling Association" },
              factory_id: 292,
              geo_images: [],
              order: 3,
              supplier: { id: 144824, uuid: "c958aad6-9040-4da3-bde1-062a5eed2922", name: "FT TEXTILE GROUP" },
              supplier_id: 144824,
              used_supplier_as_factory: false,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7433,
              inquiry_id: inquiryId,
              name: "Weaving",
              icon: "WeavingIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: { id: 292, uuid: "e71cba68-c52f-489d-86a4-4f303f4ede9e", name: "Textile Recycling Association" },
              factory_id: 292,
              geo_images: [],
              order: 4,
              supplier: { id: 144824, uuid: "c958aad6-9040-4da3-bde1-062a5eed2922", name: "FT TEXTILE GROUP" },
              supplier_id: 144824,
              used_supplier_as_factory: false,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7434,
              inquiry_id: inquiryId,
              name: "Dyeing",
              icon: "DyeingIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: null,
              factory_id: null,
              geo_images: [],
              order: 5,
              supplier: { id: 181392, uuid: "7f44e120-b1d9-4c0f-add3-bd28b32c86eb", name: "PureLoom", reference_name: "PUREL" },
              supplier_id: 181392,
              used_supplier_as_factory: true,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7435,
              inquiry_id: inquiryId,
              name: "Sampling",
              icon: "SamplingIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: { id: 267, uuid: "e339e09e-68f0-4681-8f65-cef1939b09a8", name: "Pureloom ingiriya" },
              factory_id: 267,
              geo_images: [],
              order: 6,
              supplier: { id: 181392, uuid: "7f44e120-b1d9-4c0f-add3-bd28b32c86eb", name: "PureLoom", reference_name: "PUREL" },
              supplier_id: 181392,
              used_supplier_as_factory: false,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7436,
              inquiry_id: inquiryId,
              name: "Trims",
              icon: "TrimsIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: { id: 306, uuid: "03ec3d3b-827d-434a-a389-2cc5a399d7a0", name: "Conceria XYZ" },
              factory_id: 306,
              geo_images: [],
              order: 7,
              supplier: { id: 144824, uuid: "c958aad6-9040-4da3-bde1-062a5eed2922", name: "FT TEXTILE GROUP" },
              supplier_id: 144824,
              used_supplier_as_factory: false,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7437,
              inquiry_id: inquiryId,
              name: "Manufacturing",
              icon: "ManufacturingIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: { id: 269, uuid: "067736ae-3c0b-402a-9d60-339d7965dfeb", name: "pureloom katunayake" },
              factory_id: 269,
              geo_images: [],
              order: 8,
              supplier: { id: 181392, uuid: "7f44e120-b1d9-4c0f-add3-bd28b32c86eb", name: "PureLoom", reference_name: "PUREL" },
              supplier_id: 181392,
              used_supplier_as_factory: false,
              delivery_method: null,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            },
            {
              id: 7438,
              inquiry_id: inquiryId,
              name: "Delivery",
              icon: "DeliveryIcon",
              is_consumer_record: 0,
              created_at: "2025-09-22T06:04:01.000000Z",
              updated_at: "2025-09-22T06:04:01.000000Z",
              factory: null,
              factory_id: null,
              geo_images: [],
              order: 9,
              supplier: null,
              supplier_id: null,
              used_supplier_as_factory: false,
              delivery_method: 2,
              verification_requested: 0,
              verified_by_brand: 0,
              verified_by_factory: 0
            }
          ],
          donations: [181391],
          fabricComposition: "ads",
          layout: {
            bom: true,
            supplyChain: true,
            reviews: true,
            geo: false,
            lca: true,
            view: "expanded",
            backgroundColor: "#ffffff",
            fontColor: "#473068",
            iconColor: "#70d0ce",
            titleColor: "#473068",
            verifiedColor: "#473068",
            unverifiedColor: "#ea7a66",
            repairRecycleAndResale: true
          },
          recycles: [138865],
          repairs: [181391],
          resales: [181391],
          selectedBomItems: [18517, 18520],
          sustainability: "<p>asdsad</p>",
          upcycles: [138865]
        })
      });
      
      chrome.runtime.sendMessage({ action: "log", data: "Trace saved" });
      
  
      // Wait a bit before publishing
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // 6. Publish Trace (fixed endpoint)
      const publishRes = await fetch(`https://stg-digital.seamlesssource.com/api/inquiry/${inquiryId}/trace/publish`, {
        method: "GET",
        headers: postHeaders
      });
      const publishData = await safeJson(publishRes);
  
      if (publishRes.ok && publishData?.message?.includes("published successfully")) {
        chrome.runtime.sendMessage({ action: "log", data: "Trace published successfully" });
        const traceUrl = `https://stg-digital.seamlesssource.com/#/trace/${styleNumber}`;
        chrome.runtime.sendMessage({ action: "log", data: `Trace public URL: ${traceUrl}` });
      } else {
        chrome.runtime.sendMessage({ action: "log", data: `Failed to publish trace: ${JSON.stringify(publishData)}` });
      }
  
      // 7. Send Message
      await fetch("https://stg-digital.seamlesssource.com/api/chats/8532/create_message", {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify({ collection_id: collectionId, message: "Test" })
      });
      chrome.runtime.sendMessage({ action: "log", data: "Message sent" });
  
      // 8. Logout
      await fetch("https://stg-digital.seamlesssource.com/api/logout", { method: "POST", headers: postHeaders });
      chrome.runtime.sendMessage({ action: "log", data: "Logout success" });
  
      chrome.runtime.sendMessage({ action: "log", data: "All tests completed ✅" });


    } catch (err) {
      chrome.runtime.sendMessage({ action: "log", data: `Error: ${err.message}` });
    }
  }
  