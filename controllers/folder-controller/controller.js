import mongoose from "mongoose";
import { FolderModal } from "../../model/folderModal.js";

// export const createFolder = async (req, res) => {
//   try {
//     const { name = "Untitled", parentId } = req.body;

//     const Folder = await FolderModal(req.dbName);

//     if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
//       return res.status(400).json({
//         message: "Invalid parentId. It must be a valid Mongoose ObjectId.",
//       });
//     }

//     const newFolder = await Folder.create({
//         name:name,
//         parentFolder: parentId || null,
//         userId: req.user._id,
//       });
  
//       // If parentId is provided, update the parent folder's subFolders array
//       if (parentId) {
//         await Folder.findByIdAndUpdate(parentId, {
//           $push: { subFolders: newFolder._id },
//         });
//       }

//     return res.status(201).json({
//       success: true,
//       message: "Folder created successfully",
//       data: newFolder,
//     });
//   } catch (error) {
//     console.error("Error creating folder:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while creating the folder",
//     });
//   }
// };







// export const getFoldersWithSubFolders = async (req, res) => {
//     const dbName = req.user.dbName || process.env.BASE_DB;
  
//     try {
//       const Folder = await FolderModal(dbName);
  
//       const folders = await Folder.find({ isDeleted: false, userId: req.user._id })
//         .populate("subFolders") // populate subFolders
//         .lean();

       
        
  
//       return res.status(200).json({
//         success: true,
//         message: "Folders fetched successfully",
//         data: folders,
//       });
//     } catch (error) {
//       console.error("Error fetching folders:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Something went wrong while fetching folders",
//       });
//     }
//   };
  

export const createFolder = async (req, res) => {

  try {
    const { name, parentId } = req.body;


    const Folder = await FolderModal(req.dbName);

    const existingFolder = await Folder.findOne({
      name,
      isDeleted: false,
      userId: req.user._id,
    });
    if (existingFolder) {
      return res
        .status(400)
        .json({ success: false, message: "Folder name already exists" });
    }

    let parentFolder = null;
    if (parentId) {
      parentFolder = await Folder.findById(parentId);
      if (!parentFolder) {
        return res
          .status(400)
          .json({ success: false, message: "Parent Folder not found" });
      }
    }

    const folders = new Folder({
      name,
      parentId: parentId || null,
      userId: req.user._id,
    });

    await folders.save();

    if (parentFolder) {
      parentFolder.subFolders.push(folders._id);
      await parentFolder.save();
    }

    return res
      .status(201)
      .json({
        success: true,
        message: "Folder created successfully",
        data:folders,
      });
  } catch (error) {
    console.log(error);
    
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// export const getFoldersWithSubFolders = async (req, res) => {
//   const dbName = req.user.dbName || process.env.BASE_DB;
//   const { parentId } = req.query;

//   try {
//     const Folder = await FolderModal(dbName);

//     const query = {
//       isDeleted: false,
//       userId: req.user._id,
//     };

//     if (parentId) {
//       query.parentFolder = parentId;
//     }

//     const folders = await Folder.find(query)
//       .populate("subFolders")
//       .lean();
//       console.log(folders,'folders');

//     return res.status(200).json({
//       success: true,
//       message: "Folders fetched successfully",
//       data: folders,
//     });
//   } catch (error) {
//     console.error("Error fetching folders:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching folders",
//     });
//   }
// };


const populateSubFoldersRecursively = async (folderMap, folder) => {
  if (!folder.subFolders || folder.subFolders.length === 0) {
    return folder;
  }

  
  folder.subFolders = folder.subFolders
    .map(subId => folderMap.get(subId.toString()))
    .filter(sub => sub && sub.isDeleted === false); 

  
  for (let i = 0; i < folder.subFolders.length; i++) {
    folder.subFolders[i] = await populateSubFoldersRecursively(folderMap, folder.subFolders[i]);
  }

  return folder;
};


// export const getFoldersWithSubFolders = async (req, res) => {
//   try {
//     const Folder = await FolderModal(req.dbName);

//     // Extract all query filters (except special keys like pagination, etc. if any)
//     const queryFilters = { isDeleted: false, ...req.query };

//     console.log(queryFilters,'queryFilters');
    

//     // Ensure ObjectId filters (like userId or parentId) are valid
//     for (const key in queryFilters) {
//       if (key.endsWith("Id") && !mongoose.Types.ObjectId.isValid(queryFilters[key])) {
//         return res.status(400).json({ success: false, message: `Invalid ObjectId for ${key}` });
//       }
//     }

//     let folders = await Folder.find(queryFilters).lean();

//     // Sort folders by createdAt DESC (latest first)
//     folders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     const folderMap = new Map(folders.map(fold => [fold._id.toString(), fold]));

//     let rootCategories = folders.filter(fold => !fold.parentId);

//     const populateSubFoldersRecursively = (folder) => {
//       if (!folder || !folder.subFolders) return null;

//       let subFolders = folder.subFolders
//         .map(subId => folderMap.get(subId.toString()))
//         .filter(sub => sub); // Valid subFolders

//       let filteredSubcategories = [];
//       for (let sub of subFolders) {
//         if (sub.published) {
//           filteredSubcategories.push(populateSubFoldersRecursively(sub));
//         } else {
//           let validChildren = sub.subFolders
//             .map(subId => folderMap.get(subId.toString()))
//             .filter(child => child && child.published)
//             .map(child => populateSubFoldersRecursively(child));

//           filteredSubcategories.push(...validChildren);
//         }
//       }

//       return { ...folder, subFolders: filteredSubcategories };
//     };

//     let finalFolders = [];
//     for (let folder of rootCategories) {
//       if (!folder.published) {
//         let publishedChildren = folder.subFolders
//           .map(subId => folderMap.get(subId.toString()))
//           .filter(sub => sub && sub.published)
//           .map(sub => populateSubFoldersRecursively(sub));
//         finalFolders.push(...publishedChildren);
//       } else {
//         let populatedCategory = populateSubFoldersRecursively(folder);
//         finalFolders.push(populatedCategory);
//       }
//     }

//     // Final sort by createdAt descending (optional again)
//     finalFolders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     return res.status(200).json({
//       success: true,
//       message: "Folders fetched successfully",
//       data: finalFolders,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


export const getFoldersWithSubFolders = async (req, res) => {
  try {
    const Folder = await FolderModal(req.dbName);

    // Extract all filters (like parentId, userId, published, etc.)
    const queryFilters = { isDeleted: false, ...req.query };

    // Validate any Id-like fields
    for (const key in queryFilters) {
      if (key.endsWith("Id") && !mongoose.Types.ObjectId.isValid(queryFilters[key])) {
        return res.status(400).json({ success: false, message: `Invalid ObjectId for ${key}` });
      }
    }

    const hasFilters = Object.keys(req.query).length > 0;

    if (hasFilters) {
      // Just return folders matching filters, no recursion
      const folders = await Folder.find(queryFilters).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, message: "Filtered folders fetched", data: folders });
    }

    // Else: Fetch all folders to build nested structure
    const allFolders = await Folder.find({ isDeleted: false }).lean();
    const folderMap = new Map(allFolders.map(f => [f._id.toString(), f]));

    // Recursive nesting
    const populateSubFoldersRecursively = (folder) => {
      if (!folder.subFolders || folder.subFolders.length === 0) return folder;

      const validSubs = folder.subFolders
        .map(id => folderMap.get(id.toString()))
        .filter(sub => sub && !sub.isDeleted);

      folder.subFolders = validSubs.map(populateSubFoldersRecursively);
      return folder;
    };

    const rootFolders = allFolders.filter(f => !f.parentId);
    const finalFolders = rootFolders.map(populateSubFoldersRecursively);

    return res.status(200).json({
      success: true,
      message: "All folders with nested subfolders",
      data: finalFolders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
