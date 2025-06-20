
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Upload, FileText, Download } from 'lucide-react';

const Vault = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Document Vault</h1>
          <p className="text-gray-600">Store your important financial documents safely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your documents are secure</h3>
                <p className="text-gray-600 mb-6">Bank-level encryption keeps your files safe and private</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag and drop files here, or click to browse</p>
                  <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Upload Documents
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Document Categories</h3>
                <div className="space-y-3">
                  {[
                    'Will & Testament',
                    'Insurance Policies',
                    'Investment Accounts',
                    'Tax Documents',
                    'Property Deeds',
                    'Healthcare Directives'
                  ].map((category, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{category}</span>
                      </div>
                      <span className="text-xs text-gray-500">0 files</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                    <Download className="h-4 w-4 text-gray-400 mr-2" />
                    Generate Legacy Plan PDF
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
