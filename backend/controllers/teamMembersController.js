const pool = require('../db'); 

const getAllTeamMembers = async (projectId, res) => {
    try {
        const result = await pool.query('SELECT * FROM TeamMembers WHERE projectID = $1', [projectId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getTeamMember = async (projectId, req, res) => {
    const { memberID } = req.params;
    try {
        const result = await pool.query('SELECT * FROM TeamMembers WHERE projectID = $1 AND memberID = $2', [projectId, memberID]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const createTeamMember = async (projectId, req, res) => {
    const { memberID, name, role, expertise, contactInfo } = req.body;
    try {
        const query = `
            INSERT INTO TeamMembers (memberID, projectID, name, role, expertise, contactInfo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [memberID, projectId, name, role, expertise, contactInfo];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const updateTeamMember = async (projectId, req, res) => {
    const { memberID } = req.params; // Get projectID and memberID from URL params
    const { name, role, expertise, contactInfo } = req.body;
    
    if (!name && !role && !expertise && !contactInfo) {
        return res.status(400).json({ error: 'At least one field (name, role, expertise, contactInfo) is required to update.' });
    }

    try {
        const updates = [];
        const values = [];

        if (name) {
            updates.push(`name = $${updates.length + 1}`);
            values.push(name);
        }
        if (role) {
            updates.push(`role = $${updates.length + 1}`);
            values.push(role);
        }
        if (expertise) {
            updates.push(`expertise = $${updates.length + 1}`);
            values.push(expertise);
        }
        if (contactInfo) {
            updates.push(`contactInfo = $${updates.length + 1}`);
            values.push(contactInfo);
        }

        values.push(memberID, projectId); // Add projectId for validation

        const query = `
            UPDATE TeamMembers
            SET ${updates.join(', ')}
            WHERE memberID = $${values.length - 1} AND projectID = $${values.length}
            RETURNING *;
        `;
        
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const deleteTeamMember = async (projectId, req, res) => {
    const { memberID } = req.params; // Get projectID and memberID from URL params
    try {
        const result = await pool.query('DELETE FROM TeamMembers WHERE memberID = $1 AND projectID = $2 RETURNING *', [memberID, projectId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found.' });
        }
        res.json({ message: 'Team member deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAllTeamMembers,
    getTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
};
