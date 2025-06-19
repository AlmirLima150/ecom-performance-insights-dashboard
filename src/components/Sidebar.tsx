
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  ChartBarIcon, 
  TableIcon, 
  ListIcon,
  CircleDollarSignIcon,
  CalendarIcon,
  PieChartIcon
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: ChartBarIcon,
  },
  {
    title: "Pedidos",
    url: "#pedidos",
    icon: ListIcon,
  },
  {
    title: "Clientes",
    url: "#clientes",
    icon: TableIcon,
  },
  {
    title: "Produtos",
    url: "#produtos",
    icon: TableIcon,
  },
  {
    title: "Análise UTM",
    url: "#utm",
    icon: PieChartIcon,
  },
  {
    title: "Relatórios",
    url: "#relatorios",
    icon: CalendarIcon,
  },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-[#662D91] to-[#4A226D] rounded-full p-2">
            <img src="/assets/SIMBOLO - BRANCO.png" alt="Simbolo viralizy branco" className="w-8 h-8"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Viralizy</h2>
            <p className="text-sm text-gray-500">Dashboards </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`w-full justify-start rounded-lg transition-all duration-200 ${
                      activeSection === item.url.substring(1) 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <button 
                      onClick={() => onSectionChange(item.url.substring(1))}
                      className="flex items-center space-x-3 p-3"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 text-center">
          Dashboard de E-commerce v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
