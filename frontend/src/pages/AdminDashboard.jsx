import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Button, IconButton, Paper, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { adminAPI } from '../services/api';
import { joinQueueRoom, onQueueUpdated, onTokenUpdated } from '../services/socketService';
import DashboardStats from '../components/admin/DashboardStats';
import QueueManager from '../components/admin/QueueManager';
import CustomerList from '../components/admin/CustomerList';
import CreateQueueForm from '../components/admin/CreateQueueForm';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [recentToken, setRecentToken] = useState(null);

  useEffect(() => {
    fetchDashboard();
    setupSocketListeners();
  }, []);

  useEffect(() => {
    if (selectedQueue) {
      fetchCustomers(selectedQueue);
    }
  }, [selectedQueue]);

  useEffect(() => {
    dashboardData?.queues?.forEach((queue) => {
      joinQueueRoom(queue.queueId);
    });
  }, [dashboardData]);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
      
      // Auto-select first queue if available
      if (response.data.data.queues.length > 0 && !selectedQueue) {
        setSelectedQueue(response.data.data.queues[0].queueId);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (queueId) => {
    try {
      const response = await adminAPI.getQueueCustomers(queueId);
      setCustomers(response.data.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const setupSocketListeners = () => {
    onQueueUpdated((data) => {
      // Refresh dashboard data on queue updates
      fetchDashboard();
      if (data.queueId) {
        fetchCustomers(data.queueId);
      }
    });

    onTokenUpdated((data) => {
      setRecentToken(data.entry || data);
      toast.success(data.message, {
        duration: 5000,
        icon: <PersonAddIcon />,
      });
      // Refresh customer list
      if (data.queueId) {
        fetchCustomers(data.queueId);
      }
    });
  };

  const handleCallNext = async (queueId) => {
    try {
      const response = await adminAPI.callNextCustomer(queueId);
      if (response.data.data) {
        toast.success(`Called: ${response.data.data.tokenNumber || response.data.data.user?.name || response.data.data.customerName}`);
      } else {
        toast.info(response.data.message);
      }
      fetchDashboard();
      fetchCustomers(queueId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to call next customer');
    }
  };

  const handlePause = async (queueId) => {
    try {
      await adminAPI.pauseQueue(queueId);
      toast.success('Queue paused');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to pause queue');
    }
  };

  const handleResume = async (queueId) => {
    try {
      await adminAPI.resumeQueue(queueId);
      toast.success('Queue resumed');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to resume queue');
    }
  };

  const handleComplete = async (queueId, entryId) => {
    try {
      await adminAPI.completeCustomer(queueId, entryId);
      toast.success('Customer marked as completed');
      fetchDashboard();
      fetchCustomers(queueId);
    } catch (error) {
      toast.error('Failed to complete customer');
    }
  };

  const handleRemove = async (queueId, entryId) => {
    if (!window.confirm('Are you sure you want to remove this customer?')) {
      return;
    }

    try {
      await adminAPI.removeCustomer(queueId, entryId);
      toast.success('Customer removed');
      fetchDashboard();
      fetchCustomers(queueId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove customer');
    }
  };

  const handleCreateQueue = async (queueData) => {
    setCreating(true);
    try {
      await adminAPI.createQueue(queueData);
      toast.success('Queue created successfully!');
      setCreateDialogOpen(false);
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create queue');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQueue = async (queueId, queueName) => {
    if (!window.confirm(`Are you sure you want to delete "${queueName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteQueue(queueId);
      toast.success('Queue deleted successfully');
      setSelectedQueue(null);
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete queue');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!dashboardData || dashboardData.queues.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', py: { xs: 5, sm: 8 } }}>
          <Typography variant="h5" gutterBottom>
            No queues found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first queue to start managing customers
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Queue
          </Button>
        </Box>

        <CreateQueueForm
          open={createDialogOpen}
          onCreate={handleCreateQueue}
          onCancel={() => setCreateDialogOpen(false)}
          loading={creating}
        />
      </Container>
    );
  }

  const selectedQueueData = dashboardData.queues.find(
    (q) => q.queueId === selectedQueue
  );

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Stats */}
      <Box sx={{ mb: 4 }}>
        <DashboardStats stats={dashboardData.summary} />
      </Box>

      {/* Analytics Dashboard */}
      <Box sx={{ mb: 4 }}>
        <AnalyticsPanel queues={dashboardData.queues} />
      </Box>

      {/* Create Queue Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          fullWidth={false}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Create New Queue
        </Button>
      </Box>

      {/* Queue Selection Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setSelectedQueue(dashboardData.queues[newValue]?.queueId);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {dashboardData.queues.map((queue, index) => (
            <Tab 
              key={queue.queueId} 
              label={queue.name}
              icon={
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQueue(queue.queueId, queue.name);
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      {/* Queue Manager */}
      {selectedQueueData && (
        <Box sx={{ mb: 4 }}>
          <QueueManager
            queue={selectedQueueData}
            onCallNext={handleCallNext}
            onPause={handlePause}
            onResume={handleResume}
            adminId={user?._id}
          />
        </Box>
      )}

      {/* Customer List */}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" gutterBottom>
          Customers in Queue
        </Typography>

        {recentToken && String(recentToken.queueId) === String(selectedQueue) && (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2, borderLeft: 4, borderColor: 'success.main' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {recentToken.tokenNumber || recentToken.currentToken} updated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recentToken.customer?.name || recentToken.customerName || 'Customer'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Position #{recentToken.position || '-'} - Status {recentToken.status || 'updated'}
                </Typography>
              </Box>
              <Chip label={recentToken.tokenNumber || recentToken.currentToken || 'Token'} color="success" />
            </Stack>
          </Paper>
        )}

        <CustomerList
          customers={customers}
          onComplete={handleComplete}
          onRemove={handleRemove}
        />
      </Box>

      {/* Create Queue Dialog */}
      <CreateQueueForm
        open={createDialogOpen}
        onCreate={handleCreateQueue}
        onCancel={() => setCreateDialogOpen(false)}
        loading={creating}
      />
    </Container>
  );
};

export default AdminDashboard;
