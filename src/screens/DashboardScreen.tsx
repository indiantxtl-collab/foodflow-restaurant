restaurant_dashboard = '''import React, { useEffect, useState } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Switch,
Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';

import { colors, gradients, spacing, borderRadius } from '../constants/colors';
import { GlassCard } from '../components/GlassCard';
import api from '../constants/api';
import { showMessage } from 'react-native-flash-message';

const { width } = Dimensions.get('window');

const RestaurantDashboard = () => {
const [isOpen, setIsOpen] = useState(true);
const [stats, setStats] = useState({
todayOrders: 0,
todayRevenue: 0,
pendingOrders: 0,
totalOrders: 0,
});
const [recentOrders, setRecentOrders] = useState([]);

useEffect(() => {
fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
try {
// Fetch orders
const response = await api.get('/api/orders/restaurant-orders');
const orders = response.data.data;

// Calculate stats  
  const today = new Date().toDateString();  
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);  
    
  setStats({  
    todayOrders: todayOrders.length,  
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.pricing.total, 0),  
    pendingOrders: orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,  
    totalOrders: orders.length,  
  });  
    
  setRecentOrders(orders.slice(0, 5));  
} catch (error) {  
  console.error('Dashboard Error:', error);  
}

};

const toggleStatus = () => {
setIsOpen(!isOpen);
showMessage({
message: isOpen ? 'Restaurant Closed' : 'Restaurant Open',
type: isOpen ? 'warning' : 'success',
});
};

const getStatusColor = (status) => {
switch (status) {
case 'pending': return colors.warning;
case 'confirmed': return colors.info;
case 'preparing': return colors.primary;
case 'ready': return colors.success;
case 'out_for_delivery': return colors.secondary;
default: return colors.textMuted;
}
};

return (
<View style={styles.container}>
{/* Header */}
<LinearGradient colors={gradients.dark} style={styles.header}>
<View style={styles.headerContent}>
<View>
<Text style={styles.greeting}>My Restaurant</Text>
<Text style={styles.statusText}>
Currently {isOpen ? 'Open' : 'Closed'}
</Text>
</View>
<Switch
value={isOpen}
onValueChange={toggleStatus}
trackColor={{ false: colors.surfaceLight, true: colors.success + '50' }}
thumbColor={isOpen ? colors.success : colors.textMuted}
/>
</View>
</LinearGradient>

<ScrollView showsVerticalScrollIndicator={false}>  
    {/* Stats Grid */}  
    <View style={styles.statsGrid}>  
      <GlassCard style={styles.statCard}>  
        <Icon name="today-outline" size={24} color={colors.primary} />  
        <Text style={styles.statValue}>{stats.todayOrders}</Text>  
        <Text style={styles.statLabel}>Today's Orders</Text>  
      </GlassCard>  
        
      <GlassCard style={styles.statCard}>  
        <Icon name="cash-outline" size={24} color={colors.success} />  
        <Text style={styles.statValue}>₹{stats.todayRevenue.toFixed(0)}</Text>  
        <Text style={styles.statLabel}>Today's Revenue</Text>  
      </GlassCard>  
        
      <GlassCard style={styles.statCard}>  
        <Icon name="time-outline" size={24} color={colors.warning} />  
        <Text style={styles.statValue}>{stats.pendingOrders}</Text>  
        <Text style={styles.statLabel}>Pending</Text>  
      </GlassCard>  
        
      <GlassCard style={styles.statCard}>  
        <Icon name="receipt-outline" size={24} color={colors.secondary} />  
        <Text style={styles.statValue}>{stats.totalOrders}</Text>  
        <Text style={styles.statLabel}>Total Orders</Text>  
      </GlassCard>  
    </View>  

    {/* Revenue Chart */}  
    <View style={styles.section}>  
      <Text style={styles.sectionTitle}>Revenue Overview</Text>  
      <GlassCard style={styles.chartCard}>  
        <LineChart  
          data={{  
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],  
            datasets: [{  
              data: [3000, 4500, 2800, 5200, 4800, 6500, 7200],  
            }],  
          }}  
          width={width - 64}  
          height={200}  
          chartConfig={{  
            backgroundColor: 'transparent',  
            backgroundGradientFrom: 'transparent',  
            backgroundGradientTo: 'transparent',  
            decimalPlaces: 0,  
            color: () => colors.primary,  
            labelColor: () => colors.textSecondary,  
            style: {  
              borderRadius: 16,  
            },  
            propsForDots: {  
              r: '4',  
              strokeWidth: '2',  
              stroke: colors.primary,  
            },  
          }}  
          bezier  
          style={styles.chart}  
        />  
      </GlassCard>  
    </View>  

    {/* Recent Orders */}  
    <View style={styles.section}>  
      <Text style={styles.sectionTitle}>Recent Orders</Text>  
      {recentOrders.map((order) => (  
        <GlassCard key={order._id} style={styles.orderCard}>  
          <View style={styles.orderHeader}>  
            <Text style={styles.orderId}>{order.orderId}</Text>  
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '30' }]}>  
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>  
                {order.status.toUpperCase()}  
              </Text>  
            </View>  
          </View>  
          <Text style={styles.orderItems}>  
            {order.items.length} items • ₹{order.pricing.total.toFixed(0)}  
          </Text>  
          <Text style={styles.orderTime}>  
            {new Date(order.createdAt).toLocaleTimeString()}  
          </Text>  
        </GlassCard>  
      ))}  
    </View>  

    <View style={{ height: 100 }} />  
  </ScrollView>  
</View>

);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
header: {
paddingTop: 60,
paddingHorizontal: spacing.lg,
paddingBottom: spacing.lg,
},
headerContent: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
greeting: {
fontSize: 24,
fontWeight: 'bold',
color: colors.text,
},
statusText: {
fontSize: 14,
color: colors.textSecondary,
marginTop: 4,
},
statsGrid: {
flexDirection: 'row',
flexWrap: 'wrap',
padding: spacing.lg,
gap: spacing.md,
},
statCard: {
width: (width - 56) / 2,
padding: spacing.md,
alignItems: 'center',
},
statValue: {
fontSize: 24,
fontWeight: 'bold',
color: colors.text,
marginTop: spacing.sm,
},
statLabel: {
fontSize: 12,
color: colors.textSecondary,
marginTop: 4,
},
section: {
paddingHorizontal: spacing.lg,
marginBottom: spacing.lg,
},
sectionTitle: {
fontSize: 18,
fontWeight: 'bold',
color: colors.text,
marginBottom: spacing.md,
},
chartCard: {
padding: spacing.md,
alignItems: 'center',
},
chart: {
borderRadius: borderRadius.lg,
},
orderCard: {
marginBottom: spacing.md,
padding: spacing.md,
},
orderHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.sm,
},
orderId: {
fontSize: 16,
fontWeight: 'bold',
color: colors.text,
},
statusBadge: {
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: borderRadius.sm,
},
statusText: {
fontSize: 10,
fontWeight: 'bold',
},
orderItems: {
fontSize: 14,
color: colors.textSecondary,
},
orderTime: {
fontSize: 12,
color: colors.textMuted,
marginTop: 4,
},
});

export default RestaurantDashboard;
'''

with open("/mnt/kimi/output/foodflow-ecosystem/restaurant-app/src/screens/DashboardScreen.tsx", "w") as f:
f.write(restaurant_dashboard)
