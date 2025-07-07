
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectionData {
  year: number;
  age: number;
  net_worth: number;
  portfolio_value: number;
  annual_expenses: number;
  cash_flow: number;
}

interface ProjectionTableProps {
  data: ProjectionData[];
  planName?: string;
}

const ProjectionTable = ({ data, planName }: ProjectionTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-white">
          Year-by-Year Projections{planName ? `: ${planName}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="text-gray-900 dark:text-white">Year</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Age</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Net Worth</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Portfolio Value</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Annual Expenses</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Cash Flow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="dark:border-gray-700">
                  <TableCell className="text-gray-900 dark:text-white">{row.year}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{row.age}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{formatCurrency(row.net_worth)}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{formatCurrency(row.portfolio_value)}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{formatCurrency(row.annual_expenses)}</TableCell>
                  <TableCell className={`${row.cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(row.cash_flow)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectionTable;
