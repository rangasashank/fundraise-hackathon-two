import { useState } from 'react';

interface ActionItemsListProps {
  actionItems: string[];
  title?: string;
  showCheckboxes?: boolean;
}

export default function ActionItemsList({ 
  actionItems, 
  title = "Action Items", 
  showCheckboxes = true 
}: ActionItemsListProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(actionItems.length).fill(false)
  );

  const handleToggleItem = (index: number) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const completedCount = checkedItems.filter(Boolean).length;

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: 24, 
      borderRadius: 8, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: 24,
      border: '1px solid #fff3e0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, flex: 1 }}>
          📋 {title}
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {showCheckboxes && completedCount > 0 && (
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500
            }}>
              ✅ {completedCount} completed
            </span>
          )}
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#fff3e0',
            color: '#f57c00',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500
          }}>
            {actionItems.length} item{actionItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#fafafa', 
        padding: 16, 
        borderRadius: 8,
        border: '1px solid #e0e0e0'
      }}>
        {actionItems.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: index < actionItems.length - 1 ? 16 : 0,
              padding: 12,
              backgroundColor: 'white',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              opacity: showCheckboxes && checkedItems[index] ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {showCheckboxes && (
              <input
                type="checkbox"
                checked={checkedItems[index]}
                onChange={() => handleToggleItem(index)}
                style={{
                  marginRight: 12,
                  marginTop: 2,
                  transform: 'scale(1.2)',
                  cursor: 'pointer'
                }}
              />
            )}
            
            <span style={{
              display: 'inline-block',
              width: 24,
              height: 24,
              backgroundColor: showCheckboxes && checkedItems[index] ? '#28a745' : '#ff9800',
              color: 'white',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '24px',
              fontSize: 12,
              fontWeight: 'bold',
              marginRight: 12,
              flexShrink: 0
            }}>
              {showCheckboxes && checkedItems[index] ? '✓' : index + 1}
            </span>
            
            <span style={{ 
              lineHeight: 1.6,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textDecoration: showCheckboxes && checkedItems[index] ? 'line-through' : 'none',
              flex: 1
            }}>
              {item}
            </span>
          </div>
        ))}
      </div>

      {showCheckboxes && actionItems.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 4,
          fontSize: 12,
          color: '#6c757d',
          textAlign: 'center'
        }}>
          💡 Tip: Check off action items as you complete them to track your progress
        </div>
      )}
    </div>
  );
}
