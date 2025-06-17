
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FilterState } from '@/types/dashboard';

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  produtos: string[];
  cidades: string[];
  canais: string[];
  statusOptions: string[];
}

export function Filters({ filters, onFiltersChange, produtos, cidades, canais, statusOptions }: FiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    if (date) {
      onFiltersChange({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [type]: date
        }
      });
    }
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      produto: '',
      cidade: '',
      canal: '',
      status: ''
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Análise</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Período */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Período</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "dd/MM")} - {format(filters.dateRange.to, "dd/MM")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Selecionar período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined
                }}
                onSelect={(range) => {
                  if (range?.from) handleDateSelect(range.from, 'from');
                  if (range?.to) handleDateSelect(range.to, 'to');
                  if (range?.from && range?.to) setCalendarOpen(false);
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Produto */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Produto</label>
          <Select value={filters.produto} onValueChange={(value) => onFiltersChange({ ...filters, produto: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os produtos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os produtos</SelectItem>
              {produtos.map(produto => (
                <SelectItem key={produto} value={produto}>{produto}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Cidade</label>
          <Select value={filters.cidade} onValueChange={(value) => onFiltersChange({ ...filters, cidade: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as cidades</SelectItem>
              {cidades.map(cidade => (
                <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Canal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Canal</label>
          <Select value={filters.canal} onValueChange={(value) => onFiltersChange({ ...filters, canal: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os canais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os canais</SelectItem>
              {canais.map(canal => (
                <SelectItem key={canal} value={canal}>{canal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset */}
        <div className="space-y-2 flex items-end">
          <Button onClick={resetFilters} variant="outline" className="w-full">
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
