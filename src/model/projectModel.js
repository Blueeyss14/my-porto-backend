import mysql from 'mysql2/promise';
import { db } from '../config/config.js';

const pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 10,
});

const safeParseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return tags.split(',').map(t => t.trim());
  }
};

const getAllProjects = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.id AS project_id, p.title, p.subtitle, p.description,
      c.name AS category, pi.image_url, p.pinned_at, p.tags, p.thumbnail,
      p.contributing, p.resources
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN project_images pi ON pi.project_id = p.id
    ORDER BY 
      p.pinned_at IS NOT NULL DESC,
      p.pinned_at DESC,
      p.id DESC
  `);

  if (rows.length === 0) return { msg: "No Item Here" };

  const map = {};
  rows.forEach(row => {
    const id = row.project_id;
    if (!map[id]) {
      map[id] = {
        id,
        title: row.title,
        subtitle: row.subtitle,
        description: row.description,
        category: row.category || "",
        is_pinned: !!row.pinned_at,
        image_url: [],
        tags: safeParseTags(row.tags),
        thumbnail: row.thumbnail || null,
        contributing: safeParseTags(row.contributing),
        resources: safeParseTags(row.resources)    
      };
    }
    if (row.image_url) map[id].image_url.push(row.image_url);
  });

  return Object.values(map);
};


const getProjectById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      p.id AS project_id, p.title, p.subtitle, p.description,
      c.name AS category, pi.image_url, p.pinned_at, p.tags, p.thumbnail,
      p.contributing, p.resources
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN project_images pi ON pi.project_id = p.id
    WHERE p.id = ?
  `, [id]);

  if (rows.length === 0) return null;

  const project = {
    id: rows[0].project_id,
    title: rows[0].title,
    subtitle: rows[0].subtitle,
    description: rows[0].description,
    category: rows[0].category || "",
    is_pinned: !!rows[0].pinned_at,
    image_url: [],
    tags: safeParseTags(rows[0].tags),
    thumbnail: rows[0].thumbnail || null,
    contributing: safeParseTags(rows[0].contributing),
    resources: safeParseTags(rows[0].resources)
  };

  rows.forEach(row => {
    if (row.image_url) {
      project.image_url.push(row.image_url);
    }
  });

  return project;
};


const uploadProject = async (body) => {
  const { title, subtitle, description, category, image_url, is_pinned, tags, thumbnail, contributing, resources } = body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [catRows] = await conn.query(
      'SELECT id FROM categories WHERE name = ?',
      [category]
    );

    if (catRows.length === 0) {
      throw new Error('Category not found.');
    }

    const categoryId = catRows[0].id;
    const pinnedAt = is_pinned ? new Date() : null;

    const [result] = await conn.query(
      `INSERT INTO projects 
        (title, subtitle, description, category_id, pinned_at, tags, thumbnail, contributing, resources) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle || null,
        description,
        categoryId,
        pinnedAt,
        JSON.stringify(tags || []),
        thumbnail || null,
        JSON.stringify(contributing || []), 
        JSON.stringify(resources || [])   
      ]
    );

    const projectId = result.insertId;

    if (Array.isArray(image_url) && image_url.length > 0) {
      const imgValues = image_url.map(url => [projectId, url]);
      await conn.query(
        'INSERT INTO project_images (project_id, image_url) VALUES ?',
        [imgValues]
      );
    }

    await conn.commit();
    return { 
      id: projectId, 
      title, 
      subtitle: subtitle || null,
      description, 
      category, 
      is_pinned, 
      image_url, 
      tags: tags || [], 
      thumbnail: thumbnail || null,
      contributing: contributing || [],
      resources: resources || []
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const patchProject = async (id, body) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fields = [];
    const values = [];

    if (body.title !== undefined) {
      fields.push("title = ?");
      values.push(body.title);
    }
    if (body.subtitle !== undefined) {
      fields.push("subtitle = ?");
      values.push(body.subtitle);
    }
    if (body.description !== undefined) {
      fields.push("description = ?");
      values.push(body.description);
    }
    if (body.category !== undefined) {
      const [catRows] = await conn.query(
        'SELECT id FROM categories WHERE name = ?',
        [body.category]
      );
      if (catRows.length === 0) throw new Error('Category not found.');
      fields.push("category_id = ?");
      values.push(catRows[0].id);
    }
    if (body.is_pinned !== undefined) {
      fields.push("pinned_at = ?");
      values.push(body.is_pinned ? new Date() : null);
    }
    if (body.tags !== undefined) {
      fields.push("tags = ?");
      values.push(JSON.stringify(body.tags));
    }
    if (body.thumbnail !== undefined) {
      fields.push("thumbnail = ?");
      values.push(body.thumbnail);
    }
    if (body.contributing !== undefined) {
      fields.push("contributing = ?");
      values.push(JSON.stringify(body.contributing));
    }
    if (body.resources !== undefined) {
      fields.push("resources = ?");
      values.push(JSON.stringify(body.resources));
    }

    if (fields.length > 0) {
      values.push(id);
      await conn.query(
        `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }

    if (body.delete_index !== undefined) {
      const [images] = await conn.query(
        'SELECT id FROM project_images WHERE project_id = ? ORDER BY id ASC',
        [id]
      );
      if (body.delete_index >= 0 && body.delete_index < images.length) {
        await conn.query(
          'DELETE FROM project_images WHERE id = ?',
          [images[body.delete_index].id]
        );
      }
    }

    if (body.image_url !== undefined) {
      const [images] = await conn.query(
        'SELECT id FROM project_images WHERE project_id = ? ORDER BY id ASC',
        [id]
      );

      if (body.image_index !== undefined) {
        if (body.image_index >= 0 && body.image_index < images.length) {
          await conn.query(
            'UPDATE project_images SET image_url = ? WHERE id = ?',
            [body.image_url[0], images[body.image_index].id]
          );
        }
      } else if (body.delete_index !== undefined) {
        if (body.delete_index >= 0 && body.delete_index < images.length) {
          await conn.query(
            'DELETE FROM project_images WHERE id = ?',
            [images[body.delete_index].id]
          );
        }
      } else if (body.add_images) {
        if (body.image_url.length > 0) {
          const imgValues = body.image_url.map(url => [id, url]);
          await conn.query(
            'INSERT INTO project_images (project_id, image_url) VALUES ?',
            [imgValues]
          );
        }
      } else {
        await conn.query('DELETE FROM project_images WHERE project_id = ?', [id]);
        if (body.image_url.length > 0) {
          const imgValues = body.image_url.map(url => [id, url]);
          await conn.query(
            'INSERT INTO project_images (project_id, image_url) VALUES ?',
            [imgValues]
          );
        }
      }
    }

    await conn.commit();
    return await getProjectById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


// const updateProject = async (id, body) => {
//   const { 
//     title, 
//     subtitle,
//     description, 
//     category, 
//     is_pinned, 
//     image_url, 
//     tags, 
//     thumbnail,
//     contributing,
//     resources
//   } = body;

//   const pinnedAt = is_pinned ? new Date() : null;

//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     const [catRows] = await conn.query(
//       'SELECT id FROM categories WHERE name = ?',
//       [category]
//     );
//     if (catRows.length === 0) {
//       throw new Error('Category not found.');
//     }
//     const categoryId = catRows[0].id;

//     const [result] = await conn.query(
//       `UPDATE projects 
//        SET title = ?, subtitle = ?, description = ?, category_id = ?, pinned_at = ?, 
//            tags = ?, thumbnail = ?, contributing = ?, resources = ? 
//        WHERE id = ?`,
//       [
//         title,
//         subtitle || null,
//         description,
//         categoryId,
//         pinnedAt,
//         JSON.stringify(tags || []),
//         thumbnail || null,
//         JSON.stringify(contributing || []),
//         JSON.stringify(resources || []),
//         id
//       ]
//     );

//     if (result.affectedRows === 0) {
//       await conn.rollback();
//       return null;
//     }

//     //delete old image
//     await conn.query('DELETE FROM project_images WHERE project_id = ?', [id]);

//     //insert new image
//     if (Array.isArray(image_url) && image_url.length > 0) {
//       const imgValues = image_url.map(url => [id, url]);
//       await conn.query(
//         'INSERT INTO project_images (project_id, image_url) VALUES ?',
//         [imgValues]
//       );
//     }

//     await conn.commit();
//     return { 
//       id, 
//       title, 
//       subtitle: subtitle || null,
//       description, 
//       category, 
//       is_pinned, 
//       image_url, 
//       tags: tags || [], 
//       thumbnail: thumbnail || null,
//       contributing: contributing || [],
//       resources: resources || []
//     };
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };


const removeProject = async (id) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query('DELETE FROM project_images WHERE project_id = ?', [id]);
        const [result] = await conn.query('DELETE FROM projects WHERE id = ?', [id]);

        await conn.commit();
        return result.affectedRows > 0;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export default {
  getAllProjects,
  getProjectById,
  uploadProject,
  patchProject,
  // updateProject,
  removeProject
};
