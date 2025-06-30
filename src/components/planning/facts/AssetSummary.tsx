
interface AssetSummaryProps {
  totalValue: number;
}

const AssetSummary = ({ totalValue }: AssetSummaryProps) => {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium text-blue-700 dark:text-blue-300">
          Total Portfolio Value:
        </span>
        <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
          ${totalValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default AssetSummary;
